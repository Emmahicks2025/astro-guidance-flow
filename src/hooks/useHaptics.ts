import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = () => {
  try {
    return typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const useHaptics = () => {
  const impact = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style });
    } catch {
      // Haptics not available
    }
  };

  const notification = async (type: NotificationType = NotificationType.Success) => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type });
    } catch {
      // Haptics not available
    }
  };

  const selectionClick = async () => {
    if (!isNative()) return;
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch {
      // Haptics not available
    }
  };

  return { impact, notification, selectionClick };
};

export { ImpactStyle, NotificationType };
