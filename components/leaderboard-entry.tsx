import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/avatar';
import { ClayCard } from '@/components/clay-card';
import { LeaderboardEntry } from '@/types/database';

interface LeaderboardEntryCardProps {
  entry: LeaderboardEntry;
  isPodium?: boolean;
}

const RANK_MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const MEDAL_GRADIENTS: Record<number, [string, string]> = {
  1: ['#FFF4D0', '#FFE57F'],
  2: ['#F0F0F0', '#D8D8D8'],
  3: ['#FDE8D8', '#F4C49A'],
};

export function LeaderboardEntryCard({ entry, isPodium }: LeaderboardEntryCardProps) {
  const { user } = useAuth();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');

  const isCurrentUser = user?.id === entry.user_id;
  const medal = RANK_MEDALS[entry.rank];
  const isTopThree = entry.rank >= 1 && entry.rank <= 3;
  const gradientColors = MEDAL_GRADIENTS[entry.rank];

  // Podium layout — vertical stacked card for top 3
  if (isPodium && isTopThree && gradientColors) {
    const avatarSize = entry.rank === 1 ? 56 : 44;
    return (
      <ClayCard shadowLevel={entry.rank === 1 ? 'lg' : 'md'} radius={20} style={{ padding: 0 }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.podiumCard}>
          {medal && <Text style={styles.podiumMedal}>{medal}</Text>}
          <Avatar
            uri={entry.avatar_url}
            name={entry.display_name}
            size={avatarSize}
          />
          <Text
            style={[styles.podiumName, { color: text }]}
            numberOfLines={1}>
            {entry.display_name}
          </Text>
          <Text style={[styles.podiumPoints, { color: isCurrentUser ? primary : accent }]}>
            {entry.points}
          </Text>
        </LinearGradient>
      </ClayCard>
    );
  }

  // Standard horizontal row layout for ranks 4+
  const innerContent = (
    <View style={styles.inner}>
      <View style={styles.rankContainer}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color: textSecondary }]}>#{entry.rank}</Text>
        )}
      </View>

      <Avatar
        uri={entry.avatar_url}
        name={entry.display_name}
        size={38}
      />

      <View style={styles.info}>
        <Text style={[styles.name, { color: text }]} numberOfLines={1}>
          {entry.display_name}
        </Text>
      </View>

      <Text style={[styles.points, { color: isCurrentUser ? primary : accent }]}>
        {entry.points}
      </Text>
    </View>
  );

  return (
    <ClayCard
      shadowLevel="sm"
      radius={18}
      style={[
        styles.standardCard,
        isCurrentUser && { backgroundColor: surfacePrimary },
      ]}>
      {innerContent}
    </ClayCard>
  );
}

const styles = StyleSheet.create({
  // Podium vertical layout
  podiumCard: {
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 6,
  },
  podiumMedal: { fontSize: 24, lineHeight: 30 },
  podiumName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  podiumPoints: { fontSize: 18, fontWeight: '900' },
  // Standard horizontal row
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  standardCard: {
    padding: 0,
  },
  rankContainer: { width: 32, alignItems: 'center' },
  medal: { fontSize: 22, lineHeight: 28 },
  rankNumber: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  points: { fontSize: 20, fontWeight: '900' },
});
