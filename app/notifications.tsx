import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from '@/components/notification-item';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Notification } from '@/types/database';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handlePress = useCallback((notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on entity type
    if (notification.related_entity_type && notification.related_entity_id) {
      switch (notification.related_entity_type) {
        case 'walk':
          router.push(`/walk/${notification.related_entity_id}`);
          break;
        case 'dog':
          router.push(`/dog/${notification.related_entity_id}`);
          break;
        case 'adoption_request':
          router.push(`/adoption/${notification.related_entity_id}`);
          break;
      }
    }
  }, [markAsRead, router]);

  const renderItem = useCallback(({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handlePress(item)}
    />
  ), [handlePress]);

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <>
      <Stack.Screen options={{ title: t('notifications.title') }} />
      <View style={[styles.container, { backgroundColor: background }]}>
        {unreadCount > 0 && (
          <View style={styles.markAllRow}>
            <Button
              title={t('notifications.markAllRead')}
              onPress={markAllAsRead}
              variant="outline"
              style={styles.markAllBtn}
            />
          </View>
        )}
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="🔔"
                title={t('notifications.noNotifications')}
                message={t('notifications.noNotificationsMessage')}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={primary} />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  emptyContainer: { flex: 1 },
  markAllRow: { paddingHorizontal: 16, paddingTop: 8 },
  markAllBtn: { alignSelf: 'flex-end', paddingHorizontal: 12, height: 36 },
});
