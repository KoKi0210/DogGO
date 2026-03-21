import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AdoptionRequestWithDetails } from '@/hooks/use-adoption-requests';
import { AdoptionStatus } from '@/types/database';
import { Avatar } from '@/components/avatar';

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
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');

  const dog = request.dog;
  const adopter = request.adopter;
  const statusColor = STATUS_COLORS[request.status];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={onPress}
      disabled={!onPress}>
      {dog?.photo_url ? (
        <Image source={{ uri: dog.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoEmoji}>🐕</Text>
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
          <Text style={styles.statusText}>
            {t(`adoption.status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`)}
          </Text>
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
  photo: { width: 80, height: 80 },
  photoPlaceholder: { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 32 },
  info: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  dogName: { fontSize: 16, fontWeight: '600' },
  adopterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adopterName: { fontSize: 13 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
});
