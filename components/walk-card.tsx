import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Walk, Dog, WalkStatus } from '@/types/database';
import { formatDistance, formatDuration } from '@/lib/location';
import { ClayCard } from '@/components/clay-card';

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

const SPRING_IN = { damping: 15, stiffness: 400, mass: 0.6 };
const SPRING_OUT = { damping: 12, stiffness: 200, mass: 0.8 };

export function WalkCard({ walk, onPress }: WalkCardProps) {
  const { t } = useTranslation();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const badgeColor = useThemeColor({}, STATUS_COLOR_KEY[walk.status]);
  const surfaceAccent = useThemeColor({}, 'surfaceAccent');

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dog = walk.dog;
  const date = new Date(walk.created_at).toLocaleDateString();

  return (
    <Animated.View style={[animatedStyle, styles.wrapper]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        onPressIn={() => { scale.value = withSpring(0.96, SPRING_IN); }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_OUT); }}>
        <ClayCard shadowLevel="sm" radius={20} style={styles.card}>
          {dog?.photo_url ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: dog.photo_url }} style={styles.photo} />
            </View>
          ) : (
            <View style={[styles.photoContainer, styles.photoPlaceholder]}>
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
              <View style={[styles.stats, { backgroundColor: surfaceAccent }]}>
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
        </ClayCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  card: { flexDirection: 'row', padding: 0 },
  photoContainer: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  photo: { width: 80, height: 80, resizeMode: 'cover' },
  photoPlaceholder: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 28 },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  date: { fontSize: 12 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stat: { fontSize: 12, fontWeight: '500' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
