import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs, useRouter, useFocusEffect } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePendingRequests } from '@/hooks/use-pending-requests';
import { useNotifications } from '@/hooks/use-notifications';

function TabBarBackground() {
  const colorScheme = useColorScheme();
  const card = Colors[colorScheme ?? 'light'].card;
  const shadow = Shadows.clayMd[1]; // neutral shadow for the tab bar

  return (
    <View
      style={[
        {
          flex: 1,
          borderRadius: 32,
          backgroundColor: card,
          overflow: 'visible',
        },
        shadow,
      ]}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { pendingWalks } = usePendingRequests();
  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  const card = Colors[colorScheme ?? 'light'].card;

  const pendingCount = pendingWalks.length;
  const background = Colors[colorScheme ?? 'light'].background;

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 32,
          height: 68,
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerStyle: {
          backgroundColor: background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '800' as const,
          fontSize: 22,
          letterSpacing: -0.3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={() => router.push('/notifications')} style={styles.bellBtn}>
              <IconSymbol size={24} name="bell.fill" color={Colors[colorScheme ?? 'light'].text} />
              {unreadCount > 0 && (
                <View style={[styles.bellBadge, { borderColor: card }]}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
          ),
          headerTitle: 'DogGO',
        }}
      />
      <Tabs.Screen
        name="adoption"
        options={{
          title: t('tabs.adopt'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t('tabs.leaderboard'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol size={28} name="person.fill" color={color} />
              {pendingCount > 0 && (
                <View style={[styles.tabBadge, { borderColor: card }]}>
                  <Text style={styles.tabBadgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#F44336',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bellBtn: {
    marginRight: 16,
    padding: 4,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
