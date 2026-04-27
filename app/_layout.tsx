import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '@/i18n/config';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ThemePreferenceProvider } from '@/contexts/theme-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';

SplashScreen.preventAutoHideAsync();

// TODO REMOVE THIS
export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  usePushNotifications();

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerBackTitle: 'Back' }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
        <Stack.Screen name="dog/[id]" options={{ title: 'Dog' }} />
        <Stack.Screen name="dog/add" options={{ title: 'Add Dog' }} />
        <Stack.Screen name="walk/[id]" options={{ title: 'Walk' }} />
        <Stack.Screen name="walk/summary" options={{ title: 'Walk Summary' }} />
        <Stack.Screen name="adoption/[id]" options={{ title: 'Adoption' }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="profile/dogs" options={{ title: 'My Dogs' }} />
        <Stack.Screen name="profile/walks" options={{ title: 'My Walks' }} />
        <Stack.Screen name="profile/pending" options={{ title: 'Pending Requests' }} />
        <Stack.Screen name="profile/adoptions" options={{ title: 'Adoptions' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

// TODO REMOVE THIS
export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}
