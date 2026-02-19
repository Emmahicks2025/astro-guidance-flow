import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const register = async () => {
      try {
        // Request permission
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== 'granted') {
          console.log('Push notification permission not granted');
          return;
        }

        // Register with APNs
        await PushNotifications.register();

        // Listen for registration success
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration token:', token.value);
          // Save token to database
          const { error } = await supabase
            .from('device_tokens')
            .upsert(
              { user_id: user.id, token: token.value, platform: 'ios' },
              { onConflict: 'user_id,token' }
            );
          if (error) console.error('Failed to save push token:', error);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
        });

        // Handle received notifications (foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
          // Could show an in-app toast here
        });

        // Handle notification tapped
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action:', notification);
          // Could navigate to the chat here
        });
      } catch (err) {
        console.error('Push notification setup error:', err);
      }
    };

    register();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
};
