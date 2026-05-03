import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Notification, NotificationType } from '@/types/database';
import { ClayCard } from '@/components/clay-card';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  walk_requested: 'figure.walk',
  walk_approved: 'checkmark.circle.fill',
  walk_started: 'figure.run',
  walk_completed: 'party.popper',
  adoption_request: 'heart.fill',
  adoption_approved: 'house.fill',
  leaderboard_change: 'trophy.fill',
};

const APPROVED_TYPES: NotificationType[] = ['walk_approved', 'walk_completed', 'adoption_approved'];

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const surfaceAccent = useThemeColor({}, 'surfaceAccent');

  const icon = TYPE_ICONS[notification.type] ?? 'bell.fill';
  const isUnread = !notification.read;
  const isApproved = APPROVED_TYPES.includes(notification.type);
  const timeAgo = formatTimeAgo(notification.created_at);

  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => {
    if (isUnread) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 300 }),
          withSpring(1.0, { damping: 8, stiffness: 300 })
        ),
        -1,
        false
      );
    }
  }, [isUnread]);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.wrapper}>
      <ClayCard
        shadowLevel="sm"
        radius={18}
        style={[
          styles.card,
          isUnread && { backgroundColor: surfacePrimary },
        ]}>
        <View
          style={[
            styles.iconBlob,
            { backgroundColor: isApproved ? surfaceAccent : surfacePrimary },
          ]}>
          <IconSymbol name={icon as any} size={22} color={primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: text }]} numberOfLines={1}>
              {notification.title}
            </Text>
            {isUnread && (
              <Animated.View
                style={[
                  styles.unreadDot,
                  { backgroundColor: primary },
                  pulseStyle,
                ]}
              />
            )}
          </View>
          {notification.body && (
            <Text style={[styles.body, { color: textSecondary }]} numberOfLines={2}>
              {notification.body}
            </Text>
          )}
          <Text style={[styles.time, { color: textSecondary }]}>{timeAgo}</Text>
        </View>
      </ClayCard>
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
  wrapper: { marginBottom: 12 },
  card: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBlob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '700', flex: 1 },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  body: { fontSize: 13, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 2 },
});
