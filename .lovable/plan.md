

## Fix: App Icon Missing in TestFlight

### Root Cause
The `npx cap sync ios` command overwrites the asset catalog and project file. While the workflow restores them, there's a timing issue: the `sips` image processing commands run before Xcode is set up on the runner, which can cause silent failures in icon processing.

Additionally, the Release build configuration in `project.pbxproj` has `CODE_SIGN_STYLE = Automatic` but the `xcodebuild` command overrides it with `Manual`. This mismatch can confuse the asset catalog compiler.

### Changes

**1. Fix `project.pbxproj` — Release config (lines 325-338)**
- Change `CODE_SIGN_STYLE` from `Automatic` to `Manual` in the Release build configuration
- Add `DEVELOPMENT_TEAM = LZ57VL6474` and `PROVISIONING_PROFILE_SPECIFIER` to Release config
- Add `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES` to both Debug and Release target configs
- This ensures the build settings match what the xcodebuild command expects

**2. Fix `testflight.yml` — Move Xcode setup before Capacitor sync**
- Move the "Setup Xcode" step (currently after cap sync) to **before** the "Sync Capacitor" step
- This ensures `sips` and other image tools use the correct Xcode toolchain when processing the icon
- The current order runs `sips` with whatever default tools are on the runner, which may not handle the icon correctly

**3. Fix `testflight.yml` — Add icon verification with failure**
- After icon restoration, add a check that verifies the icon file is a valid 1024x1024 PNG with no alpha
- If verification fails, the build should stop early with a clear error instead of producing an IPA with no icon

### Technical Details

Workflow step reordering:
```text
Current order:                    Fixed order:
1. Checkout                       1. Checkout
2. Install Node/Bun               2. Install Node/Bun
3. Install deps                   3. Install deps
4. Build web                      4. Build web
5. Cap sync (uses sips)           5. Setup Xcode  <-- moved up
6. Setup Xcode  <-- too late      6. Cap sync (now sips works correctly)
7. Install certs                  7. Install certs
8. Build + Upload                 8. Build + Upload
```

Release config additions in `project.pbxproj`:
```text
ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES;
CODE_SIGN_STYLE = Manual;
DEVELOPMENT_TEAM = LZ57VL6474;
PROVISIONING_PROFILE_SPECIFIER = "5174c695-432d-4b2f-af98-a29750ecddd8";
```

