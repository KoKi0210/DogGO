import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Dog } from '@/types/database';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDistance } from '@/lib/location';
import { STATUS_KEY, getBadgeColorKey } from '@/lib/dog-utils';

interface DogCardProps {
  dog: Dog;
  distance?: number | null;
  showStatusBadge?: boolean;
  onPress?: () => void;
}

export function DogCard({ dog, distance, showStatusBadge, onPress }: DogCardProps) {
  const { t } = useTranslation();
  const background = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const badgeColorMap = {
    accent: useThemeColor({}, 'accent'),
    primary,
    secondary: useThemeColor({}, 'secondary'),
    textSecondary,
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: background, borderColor: border }]}
      onPress={onPress}
      disabled={!onPress}>
      {dog.photo_url ? (
        <Image source={{ uri: dog.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: primary + '20' }]}>
          <Text style={styles.photoEmoji}>🐕</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: text }]} numberOfLines={1}>
            {dog.name}
          </Text>
          {showStatusBadge && (
            <View style={[styles.badge, { backgroundColor: badgeColorMap[getBadgeColorKey(dog.status)] }]}>
              <Text style={styles.badgeText}>{t(STATUS_KEY[dog.status])}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.breed, { color: textSecondary }]} numberOfLines={1}>
          {dog.breed}
        </Text>

        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: border }]}>
            <Text style={[styles.tagText, { color: text }]}>{t(`dogs.${dog.size}`)}</Text>
          </View>
          {distance != null && (
            <View style={[styles.tag, { backgroundColor: border }]}>
              <Text style={[styles.tagText, { color: text }]}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>
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
    width: 100,
    height: 100,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 40,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  },
  breed: {
    fontSize: 14,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
