import { useState, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { LeaderboardEntryCard } from '@/components/leaderboard-entry';
import { EmptyState } from '@/components/empty-state';
import { ClayCard } from '@/components/clay-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeaderboardEntry } from '@/types/database';

const PERIODS = ['daily', 'weekly', 'monthly', 'allTime'] as const;

const SPRING_IN = { damping: 15, stiffness: 400, mass: 0.6 };
const SPRING_OUT = { damping: 10, stiffness: 200, mass: 0.8 };

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]>('weekly');
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const text = useThemeColor({}, 'text');

  const { entries, isLoading, refresh } = useLeaderboard(activePeriod);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Top-3 and rest split
  const podiumEntries = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  const renderItem = useCallback(({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.entryWrapper}>
      <LeaderboardEntryCard entry={item} />
    </View>
  ), []);

  const keyExtractor = useCallback((item: LeaderboardEntry) => item.user_id, []);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Clay Segmented Control */}
      <ClayCard shadowLevel="sm" radius={32} style={styles.segmentOuter}>
        <View style={styles.segmentInner}>
          {PERIODS.map((period) => {
            const active = activePeriod === period;
            return (
              <SegmentButton
                key={period}
                label={t(`leaderboard.${period}`)}
                active={active}
                primaryColors={[primary, primaryLight]}
                textSecondary={textSecondary}
                onPress={() => setActivePeriod(period)}
              />
            );
          })}
        </View>
      </ClayCard>

      <FlatList
        data={restEntries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          podiumEntries.length > 0 ? (
            <View>
              {/* Podium — ranks 1-3 */}
              <View style={styles.podium}>
                {/* Rank 2 — left */}
                {podiumEntries[1] && (
                  <View style={styles.podiumSide}>
                    <LeaderboardEntryCard entry={podiumEntries[1]} isPodium />
                  </View>
                )}
                {/* Rank 1 — center, elevated */}
                {podiumEntries[0] && (
                  <View style={styles.podiumCenter}>
                    <LeaderboardEntryCard entry={podiumEntries[0]} isPodium />
                  </View>
                )}
                {/* Rank 3 — right */}
                {podiumEntries[2] && (
                  <View style={styles.podiumSide}>
                    <LeaderboardEntryCard entry={podiumEntries[2]} isPodium />
                  </View>
                )}
              </View>
              {restEntries.length > 0 && (
                <View style={styles.sectionHeader}>
                  <View style={[styles.accentBar, { backgroundColor: primary }]} />
                  <Text style={[styles.sectionTitle, { color: text }]}>
                    {t(`leaderboard.${activePeriod}`)}
                  </Text>
                </View>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && entries.length === 0 ? (
            <EmptyState
              icon="🏆"
              title={t('leaderboard.noEntries')}
              message={t('leaderboard.noEntriesMessage')}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={primary} />
        }
      />
    </View>
  );
}

function SegmentButton({
  label,
  active,
  primaryColors,
  textSecondary,
  onPress,
}: {
  label: string;
  active: boolean;
  primaryColors: [string, string];
  textSecondary: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92, SPRING_IN); }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_OUT); }}>
        {active ? (
          <LinearGradient
            colors={primaryColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.segment}>
            <Text style={styles.segmentTextActive}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.segment}>
            <Text style={[styles.segmentText, { color: textSecondary }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  segmentOuter: {
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  segmentInner: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    paddingVertical: 10,
    borderRadius: 28,
    alignItems: 'center',
  },
  segmentTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: { paddingHorizontal: 16, paddingBottom: 110 },
  emptyContainer: { flex: 1 },
  entryWrapper: { marginBottom: 8 },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  podiumCenter: {
    flex: 38,
    marginTop: -16,
  },
  podiumSide: {
    flex: 31,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
});
