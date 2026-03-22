import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Notification, NotificationType } from '@/types/database';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  walk_requested: '🚶',
  walk_approved: '✅',
  walk_started: '🏃',
  walk_completed: '🎉',
  adoption_request: '❤️',
  adoption_approved: '🏠',
  leaderboard_change: '🏆',
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const icon = TYPE_ICONS[notification.type] ?? '🔔';
  const isUnread = !notification.read;
  const timeAgo = formatTimeAgo(notification.created_at);

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: isUnread ? primary + '08' : cardBg,
          borderColor: isUnread ? primary + '30' : border,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}>
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          {isUnread && <View style={[styles.unreadDot, { backgroundColor: primary }]} />}
        </View>
        {notification.body && (
          <Text style={[styles.body, { color: textSecondary }]} numberOfLines={2}>
            {notification.body}
          </Text>
        )}
        <Text style={[styles.time, { color: textSecondary }]}>{timeAgo}</Text>
      </View>
    </Pressable>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    alignItems: 'flex-start',
  },
  icon: { fontSize: 24, marginTop: 2 },
  content: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: 13, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 2 },
});
