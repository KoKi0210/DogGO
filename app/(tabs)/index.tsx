import { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNearbyDogs, DogWithDistance } from '@/hooks/use-nearby-dogs';
import { useMyDogs } from '@/hooks/use-my-dogs';
import { useMyWalks } from '@/hooks/use-my-walks';
import { useAuth } from '@/contexts/auth-context';
import { getCurrentLocation } from '@/lib/location';
import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Dog } from '@/types/database';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  useEffect(() => {
    getCurrentLocation().then((loc) => {
      if (loc) {
        setUserLat(loc.latitude);
        setUserLon(loc.longitude);
      }
    });
  }, []);

  const { dogs, isLoading, refresh } = useNearbyDogs(userLat, userLon);
  const { dogs: allMyDogs, refresh: refreshMyDogs } = useMyDogs();
  const { walks, refresh: refreshWalks } = useMyWalks();

  const myActiveDogs = useMemo(
    () => allMyDogs.filter((d) => d.status === 'walk' || d.status === 'both'),
    [allMyDogs]
  );

  const activeWalk = useMemo(
    () => walks.find((w) => w.status === 'active'),
    [walks]
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshMyDogs();
      refreshWalks();
    }, [refresh, refreshMyDogs, refreshWalks])
  );

  const navigateToAddDog = useCallback(() => {
    router.push('/dog/add');
  }, [router]);

  const renderItem = useCallback(({ item }: { item: DogWithDistance }) => (
    <DogCard
      dog={item}
      distance={item.distance}
      onPress={() => router.push(`/dog/${item.id}`)}
    />
  ), [router]);

  const renderMyDogItem = useCallback((dog: Dog) => (
    <DogCard
      key={dog.id}
      dog={dog}
      showStatusBadge
      onPress={() => router.push(`/dog/${dog.id}`)}
    />
  ), [router]);

  const keyExtractor = useCallback((item: DogWithDistance) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <FlatList
        data={dogs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={dogs.length === 0 && myActiveDogs.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          <View>
            {/* Active Walk Resume Banner */}
            {activeWalk && (
              <Pressable
                style={[styles.activeWalkBanner, { backgroundColor: primary }]}
                onPress={() => router.push(`/walk/${activeWalk.id}`)}
              >
                <Text style={styles.bannerEmoji}>🏃</Text>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>
                    {t('walks.activeWalkBanner', { dogName: activeWalk.dog?.name ?? '' })}
                  </Text>
                  <Text style={styles.bannerSubtitle}>{t('walks.tapToResume')}</Text>
                </View>
              </Pressable>
            )}
            {/* Streak Card */}
            {profile && profile.streak_count > 0 && (
              <View style={[styles.streakCard, { backgroundColor: card, borderColor: border }]}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <View>
                  <Text style={[styles.streakCount, { color: accent }]}>
                    {profile.streak_count} {t('profile.streak')}
                  </Text>
                  <Text style={[styles.streakPoints, { color: primary }]}>
                    +{profile.streak_count * 5} {t('profile.points').toLowerCase()}
                  </Text>
                </View>
              </View>
            )}
            {dogs.length > 0 && (
              <Text style={[styles.header, { color: text }]}>{t('dogs.nearbyDogs')}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading && myActiveDogs.length === 0 ? (
            <EmptyState
              icon="🐕"
              title={t('dogs.noDogs')}
              message={t('dogs.noDogsMessage')}
              actionLabel={t('dogs.addDog')}
              onAction={navigateToAddDog}
            />
          ) : null
        }
        ListFooterComponent={
          myActiveDogs.length > 0 ? (
            <View style={styles.myDogsSection}>
              <Text style={[styles.header, { color: text }]}>{t('dogs.myActiveDogs')}</Text>
              {myActiveDogs.map(renderMyDogItem)}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={primary} />
        }
      />

      {/* Floating Action Button */}
      {(dogs.length > 0 || myActiveDogs.length > 0) && (
        <Pressable
          style={[styles.fab, { backgroundColor: primary }]}
          onPress={navigateToAddDog}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 60 },
  emptyContainer: { flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  myDogsSection: { marginTop: 24 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  streakEmoji: { fontSize: 28 },
  streakCount: { fontSize: 16, fontWeight: '700' },
  streakPoints: { fontSize: 12, fontWeight: '500', marginTop: 2 },
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
  activeWalkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerEmoji: { fontSize: 28 },
  bannerContent: { flex: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bannerSubtitle: { color: '#FFFFFFCC', fontSize: 13, marginTop: 2 },
});
