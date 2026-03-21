import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/avatar';
import { LeaderboardEntry } from '@/types/database';

interface LeaderboardEntryCardProps {
  entry: LeaderboardEntry;
}

const RANK_MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function LeaderboardEntryCard({ entry }: LeaderboardEntryCardProps) {
  const { user } = useAuth();
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');

  const isCurrentUser = user?.id === entry.user_id;
  const medal = RANK_MEDALS[entry.rank];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isCurrentUser ? primary + '10' : cardBg,
          borderColor: isCurrentUser ? primary : border,
        },
      ]}>
      <View style={styles.rankContainer}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color: textSecondary }]}>#{entry.rank}</Text>
        )}
      </View>

      <Avatar uri={entry.avatar_url} name={entry.display_name} size={40} />

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
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  rankContainer: { width: 32, alignItems: 'center' },
  medal: { fontSize: 22 },
  rankNumber: { fontSize: 16, fontWeight: '600' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500' },
  points: { fontSize: 18, fontWeight: 'bold' },
});
