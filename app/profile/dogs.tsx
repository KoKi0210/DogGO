import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMyDogs } from '@/hooks/use-my-dogs';
import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Dog } from '@/types/database';

export default function MyDogsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const { dogs, isLoading, refresh } = useMyDogs();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = useCallback(({ item }: { item: Dog }) => (
    <DogCard
      dog={item}
      showStatusBadge
      onPress={() => router.push(`/dog/${item.id}`)}
    />
  ), [router]);

  const keyExtractor = useCallback((item: Dog) => item.id, []);

  return (
    <>
      <Stack.Screen options={{ title: t('profile.myDogs') }} />
      <View style={[styles.container, { backgroundColor: background }]}>
        <FlatList
          data={dogs}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={dogs.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="🐕"
                title={t('profile.noDogs')}
                message={t('profile.addFirstDog')}
                actionLabel={t('dogs.addDog')}
                onAction={() => router.push('/dog/add')}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={primary} />
          }
        />

        <Pressable
          style={[styles.fab, { backgroundColor: primary }]}
          onPress={() => router.push('/dog/add')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  emptyContainer: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
