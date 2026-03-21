import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePendingRequests, PendingWalkRequest } from '@/hooks/use-pending-requests';
import { WalkCard } from '@/components/walk-card';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function PendingRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const { pendingWalks, isLoading, refresh } = usePendingRequests();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = useCallback(({ item }: { item: PendingWalkRequest }) => (
    <WalkCard walk={item} onPress={() => router.push(`/walk/${item.id}`)} />
  ), [router]);

  const keyExtractor = useCallback((item: PendingWalkRequest) => item.id, []);

  return (
    <>
      <Stack.Screen options={{ title: t('profile.pendingRequests') }} />
      <View style={[styles.container, { backgroundColor: background }]}>
        <FlatList
          data={pendingWalks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={pendingWalks.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="📬"
                title={t('walks.noPendingWalks')}
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
  emptyContainer: { flex: 1 },
});
