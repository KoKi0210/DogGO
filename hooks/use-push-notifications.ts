import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { type EventSubscription } from 'expo-modules-core';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    async function register() {
      if (!Device.isDevice) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
        });
      }

      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId ?? undefined,
      });
      const pushToken = tokenData.data;

      await supabase
        .from('profiles')
        .update({ push_token: pushToken })
        .eq('id', user!.id);
    }

    register();
  }, [user]);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          relatedEntityType?: string;
          relatedEntityId?: string;
        } | undefined;

        if (!data) {
          router.push('/notifications');
          return;
        }

        switch (data.relatedEntityType) {
          case 'walk':
            router.push(`/walk/${data.relatedEntityId}` as any);
            break;
          case 'dog':
            router.push(`/dog/${data.relatedEntityId}` as any);
            break;
          case 'adoption_request':
            router.push(`/adoption/${data.relatedEntityId}` as any);
            break;
          default:
            router.push('/notifications');
        }
      }
    );

    return () => {
      responseListener.current?.remove();
    };
  }, [router]);
}
