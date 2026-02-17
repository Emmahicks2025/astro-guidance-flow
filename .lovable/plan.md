

## What's Wrong

There are multiple issues preventing the voice call from working:

1. **ElevenLabs Agent Creation Fails (400 error)**: The edge function tries to auto-create an ElevenLabs Conversational AI agent via API, but the request body format is incorrect (likely the `asr`, `tts`, and `overrides` structure doesn't match the current ElevenLabs API). This blocks everything.

2. **Auth Bug in Token Request**: The frontend sends `Authorization: Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}` instead of the user's actual access token when fetching the conversation token - so the edge function can't identify the user.

3. **UI Layout Issue**: The green call button is likely pushed off-screen because the dialog uses `h-[85vh]` and the content uses `justify-between` with too much spacing, causing the button to be hidden below the fold on smaller viewports.

## The Fix

### 1. Fix the ElevenLabs Agent Creation (Edge Function)

The `elevenlabs-conversation-token` function will be simplified. Instead of auto-creating agents via the API (which is fragile and format-dependent), we'll:
- Remove the `getOrCreateAgent` function entirely
- Accept an `agentId` as an environment variable/secret (`ELEVENLABS_AGENT_ID`) that you create once in the ElevenLabs dashboard with overrides enabled
- The function only fetches a conversation token for that pre-configured agent

This is the recommended approach from ElevenLabs docs -- create the agent in their dashboard where you can enable overrides, then just use the API for token generation.

You will need to:
- Go to [ElevenLabs dashboard](https://elevenlabs.io) and create a Conversational AI agent
- Enable overrides for: prompt, first message, language, and voice
- Copy the Agent ID
- I'll ask you to enter it as a secret

### 2. Fix the Auth Token in Frontend

Change line 289 from:
```
Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
```
to:
```
Authorization: `Bearer ${accessToken}`
```

### 3. Fix the Call UI Layout

- Reduce padding and spacing in the call tab so the green call button is always visible
- Make the avatar section and button area properly fit within the dialog
- Center the call button visually so it's impossible to miss

### 4. Ringtone Fix for Mobile

The current ringtone creates an AudioContext outside a direct user gesture on some browsers. We'll ensure the AudioContext is created inside the button click handler to satisfy browser autoplay policies.

---

## Technical Details

### Files to Modify

**`supabase/functions/elevenlabs-conversation-token/index.ts`**
- Remove `getOrCreateAgent()` function
- Read `ELEVENLABS_AGENT_ID` from secrets (via `getApiKey`)
- Simplify to just fetch a token for that agent ID

**`src/components/consultation/ExpertConsultationDialog.tsx`**
- Fix Authorization header on token fetch (line 289): use `accessToken` not publishable key
- Adjust call tab layout: reduce `py-8` to `py-4`, compact avatar size, ensure button is always in view
- Move AudioContext creation into the `startCall` click handler scope for mobile compatibility

### New Secret Required
- `ELEVENLABS_AGENT_ID` -- the agent ID from ElevenLabs dashboard (you'll be prompted to enter it)

