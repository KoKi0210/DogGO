import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Walk, Dog, WalkStatus } from '@/types/database';
import { formatDistance, formatDuration } from '@/lib/location';

interface WalkCardProps {
  walk: Walk & { dog: Dog | null };
  onPress?: () => void;
}

const STATUS_COLOR_KEY: Record<WalkStatus, 'accent' | 'primary' | 'secondary' | 'textSecondary' | 'error'> = {
  requested: 'secondary',
  approved: 'accent',
  active: 'primary',
  completed: 'accent',
  cancelled: 'textSecondary',
};

const STATUS_I18N: Record<WalkStatus, string> = {
  requested: 'walks.statusRequested',
  approved: 'walks.statusApproved',
  active: 'walks.statusActive',
  completed: 'walks.statusCompleted',
  cancelled: 'walks.statusCancelled',
};

export function WalkCard({ walk, onPress }: WalkCardProps) {
  const { t } = useTranslation();
  const background = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const badgeColor = useThemeColor({}, STATUS_COLOR_KEY[walk.status]);

  const dog = walk.dog;
  const date = new Date(walk.created_at).toLocaleDateString();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: background, borderColor: border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {dog?.photo_url ? (
        <Image source={{ uri: dog.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoEmoji}>🐕</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: text }]} numberOfLines={1}>
            {dog?.name ?? 'Unknown Dog'}
          </Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{t(STATUS_I18N[walk.status])}</Text>
          </View>
        </View>

        <Text style={[styles.date, { color: textSecondary }]}>{date}</Text>

        {walk.status === 'completed' && walk.distance_km != null && walk.duration_mins != null && (
          <View style={styles.stats}>
            <Text style={[styles.stat, { color: text }]}>
              {formatDistance(walk.distance_km)}
            </Text>
            <Text style={[styles.stat, { color: textSecondary }]}> · </Text>
            <Text style={[styles.stat, { color: text }]}>
              {formatDuration(walk.duration_mins)}
            </Text>
            {walk.points_earned != null && (
              <>
                <Text style={[styles.stat, { color: textSecondary }]}> · </Text>
                <Text style={[styles.stat, { color: text }]}>
                  {walk.points_earned} pts
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photo: {
    width: 72,
    height: 72,
  },
  photoPlaceholder: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stat: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
