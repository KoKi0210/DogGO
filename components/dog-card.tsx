import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Dog, DogStatus } from '@/types/database';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDistance } from '@/lib/location';
import { ClayCard } from '@/components/clay-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPRING_IN, SPRING_OUT } from '@/constants/animations';

interface DogCardProps {
  dog: Dog;
  distance?: number | null;
  showStatusBadge?: boolean;
  onPress?: () => void;
}

const STATUS_KEY: Record<DogStatus, string> = {
  walk: 'dogs.statusWalk',
  adoption: 'dogs.statusAdoption',
  both: 'dogs.statusBoth',
  adopted: 'dogs.statusAdopted',
};

const BADGE_COLOR_KEY: Record<DogStatus, 'accent' | 'primary' | 'secondary' | 'textSecondary'> = {
  walk: 'accent',
  adoption: 'primary',
  both: 'secondary',
  adopted: 'textSecondary',
};

function DogCardBase({ dog, distance, showStatusBadge, onPress }: DogCardProps) {
  const { t } = useTranslation();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const badgeColor = useThemeColor({}, BADGE_COLOR_KEY[dog.status]);
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const surfacePrimaryEnd = useThemeColor({}, 'surfacePrimaryEnd');
  const surfaceAccent = useThemeColor({}, 'surfaceAccent');
  const accent = useThemeColor({}, 'accent');
  const textOnPrimary = useThemeColor({}, 'textOnPrimary');

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, styles.wrapper]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        onPressIn={() => { scale.value = withSpring(0.96, SPRING_IN); }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_OUT); }}>
        <ClayCard shadowLevel="md" radius={20} style={styles.card}>
          {dog.photo_url ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: dog.photo_url }} style={styles.photo} />
            </View>
          ) : (
            <LinearGradient
              colors={[surfacePrimary, surfacePrimaryEnd]}
              style={[styles.photoContainer, styles.photoPlaceholder]}>
              <IconSymbol name="pawprint.fill" size={40} color={primary} />
            </LinearGradient>
          )}

          <View style={styles.info}>
            <View style={styles.row}>
              <Text style={[styles.name, { color: text }]} numberOfLines={1}>{dog.name}</Text>
              {showStatusBadge && (
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                  <Text style={[styles.badgeText, { color: textOnPrimary }]}>{t(STATUS_KEY[dog.status])}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.breed, { color: textSecondary }]} numberOfLines={1}>{dog.breed}</Text>
            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: surfacePrimary }]}>
                <Text style={[styles.tagText, { color: primary }]}>{t(`dogs.${dog.size}`)}</Text>
              </View>
              {distance != null && (
                <View style={[styles.tag, { backgroundColor: surfaceAccent }]}>
                  <Text style={[styles.tagText, { color: accent }]}>{formatDistance(distance)}</Text>
                </View>
              )}
            </View>
          </View>
        </ClayCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  card: { flexDirection: 'row', padding: 0 },
  photoContainer: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  photo: { width: 110, height: 110, resizeMode: 'cover' },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },

  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 18, fontWeight: '800', flexShrink: 1, letterSpacing: -0.3 },
  breed: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  tags: { flexDirection: 'row', gap: 6, marginTop: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

export const DogCard = memo(DogCardBase);
