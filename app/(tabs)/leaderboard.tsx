import { useState, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { LeaderboardEntryCard } from '@/components/leaderboard-entry';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeaderboardEntry } from '@/types/database';

const PERIODS = ['daily', 'weekly', 'monthly', 'allTime'] as const;

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]>('weekly');
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');

  const { entries, isLoading, refresh } = useLeaderboard(activePeriod);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = useCallback(({ item }: { item: LeaderboardEntry }) => (
    <LeaderboardEntryCard entry={item} />
  ), []);

  const keyExtractor = useCallback((item: LeaderboardEntry) => item.user_id, []);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.segmentControl, { backgroundColor: card, borderColor: border }]}>
        {PERIODS.map((period) => (
          <Pressable
            key={period}
            onPress={() => setActivePeriod(period)}
            style={[
              styles.segment,
              activePeriod === period && { backgroundColor: primary },
            ]}>
            <Text
              style={[
                styles.segmentText,
                { color: activePeriod === period ? '#FFFFFF' : textSecondary },
              ]}>
              {t(`leaderboard.${period}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          !isLoading ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  segmentControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: { paddingHorizontal: 16 },
  emptyContainer: { flex: 1 },
});
