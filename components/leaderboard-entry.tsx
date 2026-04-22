import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/avatar';
import { ClayCard } from '@/components/clay-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LeaderboardEntry } from '@/types/database';

interface LeaderboardEntryCardProps {
  entry: LeaderboardEntry;
  isPodium?: boolean;
}

const MEDAL_ICON_COLORS: Record<number, { light: string; dark: string }> = {
  1: { light: '#D4A017', dark: '#FFD700' },
  2: { light: '#808080', dark: '#C0C0C0' },
  3: { light: '#B87333', dark: '#DBA06D' },
};

export function LeaderboardEntryCard({ entry, isPodium }: LeaderboardEntryCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const schemeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const accent = useThemeColor({}, 'accent');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const medalText = useThemeColor({}, 'medalText');
  const textOnPrimary = useThemeColor({}, 'textOnPrimary');

  // Medal gradient tokens
  const medalGold = useThemeColor({}, 'medalGold');
  const medalGoldEnd = useThemeColor({}, 'medalGoldEnd');
  const medalSilver = useThemeColor({}, 'medalSilver');
  const medalSilverEnd = useThemeColor({}, 'medalSilverEnd');
  const medalBronze = useThemeColor({}, 'medalBronze');
  const medalBronzeEnd = useThemeColor({}, 'medalBronzeEnd');

  const isCurrentUser = user?.id === entry.user_id;
  const isTopThree = entry.rank >= 1 && entry.rank <= 3;

  const gradientMap: Record<number, [string, string]> = {
    1: [medalGold, medalGoldEnd],
    2: [medalSilver, medalSilverEnd],
    3: [medalBronze, medalBronzeEnd],
  };

  const gradientColors = gradientMap[entry.rank];

  // Podium layout — vertical stacked card for top 3
  if (isPodium && isTopThree && gradientColors) {
    const avatarSize = entry.rank === 1 ? 56 : 44;
    const iconColor = MEDAL_ICON_COLORS[entry.rank];
    return (
      <ClayCard shadowLevel={entry.rank === 1 ? 'lg' : 'md'} radius={20} style={{ padding: 0 }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.podiumCard}>
          <IconSymbol
            name="medal.fill"
            size={entry.rank === 1 ? 28 : 24}
            color={iconColor?.[schemeKey] ?? primary}
          />
          <Avatar
            uri={entry.avatar_url}
            name={entry.display_name}
            size={avatarSize}
          />
          <View style={styles.podiumNameRow}>
            <Text
              style={[styles.podiumName, { color: medalText }]}
              numberOfLines={1}>
              {entry.display_name}
            </Text>
            {isCurrentUser && (
              <LinearGradient
                colors={[primary, primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.youBadge}>
                <Text style={[styles.youBadgeText, { color: textOnPrimary }]}>
                  {t('leaderboard.you')}
                </Text>
              </LinearGradient>
            )}
          </View>
          <Text style={[styles.podiumPoints, { color: isCurrentUser ? primary : accent }]}>
            {entry.points} {t('leaderboard.pts')}
          </Text>
        </LinearGradient>
      </ClayCard>
    );
  }

  // Standard horizontal row layout for ranks 4+
  const iconColor = MEDAL_ICON_COLORS[entry.rank];
  const innerContent = (
    <View style={styles.inner}>
      <View style={styles.rankContainer}>
        {isTopThree && iconColor ? (
          <IconSymbol name="medal.fill" size={22} color={iconColor[schemeKey]} />
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
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: text }]} numberOfLines={1}>
            {entry.display_name}
          </Text>
          {isCurrentUser && (
            <LinearGradient
              colors={[primary, primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.youBadge}>
              <Text style={[styles.youBadgeText, { color: textOnPrimary }]}>
                {t('leaderboard.you')}
              </Text>
            </LinearGradient>
          )}
        </View>
      </View>

      <Text style={[styles.points, { color: isCurrentUser ? primary : accent }]}>
        {entry.points} {t('leaderboard.pts')}
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
  podiumNameRow: {
    alignItems: 'center',
    gap: 4,
  },
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  rankNumber: { fontSize: 16, fontWeight: '700' },
  points: { fontSize: 20, fontWeight: '900' },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
