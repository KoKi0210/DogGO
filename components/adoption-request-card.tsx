import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AdoptionRequestWithDetails } from '@/hooks/use-adoption-requests';
import { AdoptionStatus } from '@/types/database';
import { Avatar } from '@/components/avatar';
import { ClayCard } from '@/components/clay-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPRING_IN, SPRING_OUT } from '@/constants/animations';

interface AdoptionRequestCardProps {
  request: AdoptionRequestWithDetails;
  variant: 'sent' | 'received';
  onPress?: () => void;
}

const STATUS_COLORS: Record<AdoptionStatus, string> = {
  pending: '#FF9800',
  approved: '#4CAF50',
  rejected: '#F44336',
};

export function AdoptionRequestCard({ request, variant, onPress }: AdoptionRequestCardProps) {
  const { t } = useTranslation();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const textOnPrimary = useThemeColor({}, 'textOnPrimary');

  const dog = request.dog;
  const adopter = request.adopter;
  const statusColor = STATUS_COLORS[request.status];

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
          {dog?.photo_url ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: dog.photo_url }} style={styles.photo} />
            </View>
          ) : (
            <View style={[styles.photoContainer, styles.photoPlaceholder, { backgroundColor: surfacePrimary }]}>
              <IconSymbol name="pawprint.fill" size={32} color={primary} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={[styles.dogName, { color: text }]} numberOfLines={1}>
              {dog?.name ?? t('common.error')}
            </Text>

            {variant === 'received' && adopter && (
              <View style={styles.adopterRow}>
                <Avatar uri={adopter.avatar_url} name={adopter.display_name} size={20} />
                <Text style={[styles.adopterName, { color: textSecondary }]} numberOfLines={1}>
                  {adopter.display_name}
                </Text>
              </View>
            )}

            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={[styles.statusText, { color: textOnPrimary }]}>
                {t(`adoption.status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`)}
              </Text>
            </View>
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
    width: 88,
    height: 88,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  photo: { width: 88, height: 88, resizeMode: 'cover' },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },

  info: { flex: 1, padding: 12, justifyContent: 'center', gap: 6 },
  dogName: { fontSize: 16, fontWeight: '700' },
  adopterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adopterName: { fontSize: 13 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
