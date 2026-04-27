import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMyWalks, WalkHistoryItem } from '@/hooks/use-my-walks';
import { WalkCard } from '@/components/walk-card';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WalkStatus } from '@/types/database';

type FilterValue = WalkStatus | 'all';

const STATUSES: FilterValue[] = ['all', 'active', 'requested', 'approved', 'completed', 'cancelled'];

export default function MyWalksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const { walks, isLoading, refresh } = useMyWalks();
  const [filter, setFilter] = useState<FilterValue>('all');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filtered = useMemo(
    () => filter === 'all' ? walks : walks.filter((w) => w.status === filter),
    [walks, filter]
  );

  const handleWalkPress = useCallback((walk: WalkHistoryItem) => {
    if (walk.status === 'completed') {
      router.push(`/walk/summary?walkId=${walk.id}`);
    } else {
      router.push(`/walk/${walk.id}`);
    }
  }, [router]);

  const renderItem = useCallback(({ item }: { item: WalkHistoryItem }) => (
    <WalkCard walk={item} onPress={() => handleWalkPress(item)} />
  ), [handleWalkPress]);

  const keyExtractor = useCallback((item: WalkHistoryItem) => item.id, []);

  const getChipLabel = (status: FilterValue) => {
    if (status === 'all') return t('profile.allStatuses');
    return t(`walks.status${status.charAt(0).toUpperCase() + status.slice(1)}`);
  };

  const listHeader = (
    <View>
      <Button
        title={t('profile.newWalk')}
        onPress={() => router.push('/(tabs)')}
        style={styles.newWalkBtn}
      />
      <View style={styles.chipRow}>
        {STATUSES.map((s) => {
          const selected = filter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setFilter(s)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? primary : card,
                  borderColor: selected ? primary : border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : text }]}>
                {getChipLabel(s)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('profile.myWalks') }} />
      <View style={[styles.container, { backgroundColor: background }]}>
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="figure.walk"
                title={t('walks.noWalks')}
                message={t('walks.noWalksMessage')}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={primary} />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  emptyContainer: { flex: 1, padding: 16 },
  newWalkBtn: { marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
});
