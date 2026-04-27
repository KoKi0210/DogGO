import { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNearbyDogs, DogWithDistance } from '@/hooks/use-nearby-dogs';
import { useMyDogs } from '@/hooks/use-my-dogs';
import { useMyWalks } from '@/hooks/use-my-walks';
import { useAuth } from '@/contexts/auth-context';
import { getCurrentLocation } from '@/lib/location';
import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { ClayCard } from '@/components/clay-card';
import { FilterBar } from '@/components/filter-bar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/theme';
import { Dog, DogSize, EnergyLevel } from '@/types/database';

const SPRING_IN = { damping: 15, stiffness: 400, mass: 0.6 };
const SPRING_OUT = { damping: 10, stiffness: 200, mass: 0.8 };

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const accent = useThemeColor({}, 'accent');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const surfacePrimaryEnd = useThemeColor({}, 'surfacePrimaryEnd');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<DogSize[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);

  useEffect(() => {
    getCurrentLocation().then((loc) => {
      if (loc) {
        setUserLat(loc.latitude);
        setUserLon(loc.longitude);
      }
    });
  }, []);

  const { dogs, isLoading, refresh } = useNearbyDogs(userLat, userLon, selectedSizes, maxDistance, energyLevel);
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

  const handleToggleSize = useCallback((size: DogSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

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

  // Banner spring animation
  const bannerScale = useSharedValue(1);
  const bannerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bannerScale.value }],
  }));

  // FAB entrance animation
  const fabScale = useSharedValue(0.7);
  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));
  useEffect(() => {
    fabScale.value = withSpring(1, { damping: 8, stiffness: 180 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              <Animated.View style={bannerAnimStyle}>
                <Pressable
                  onPress={() => router.push(`/walk/${activeWalk.id}`)}
                  onPressIn={() => { bannerScale.value = withSpring(0.96, SPRING_IN); }}
                  onPressOut={() => { bannerScale.value = withSpring(1, SPRING_OUT); }}>
                  <LinearGradient
                    colors={[primary, primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.activeWalkBanner, Shadows.clayMd[0]]}>
                    <View style={styles.bannerEmojiBlob}>
                      <IconSymbol name="figure.walk" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.bannerContent}>
                      <Text style={styles.bannerTitle}>
                        {t('walks.activeWalkBanner', { dogName: activeWalk.dog?.name ?? '' })}
                      </Text>
                      <Text style={styles.bannerSubtitle}>{t('walks.tapToResume')}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* Streak Hero Card */}
            {profile && profile.streak_count > 0 && (
              <ClayCard shadowLevel="lg" radius={24} style={{ padding: 0 }}>
                <LinearGradient
                  colors={[surfacePrimary, surfacePrimaryEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.streakCard}>
                  {/* Decorative blob */}
                  <View style={styles.streakBlob} />
                  <View style={[styles.streakEmojiBlob, { backgroundColor: surfacePrimary }]}>
                    <IconSymbol name="flame.fill" size={40} color={primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.streakCount, { color: primary }]}>
                      {profile.streak_count}
                    </Text>
                    <Text style={[styles.streakLabel, { color: textSecondary }]}>
                      {t('profile.streak')}
                    </Text>
                    <View style={[styles.streakBonusPill, { backgroundColor: surfacePrimary }]}>
                      <Text style={[styles.streakPoints, { color: accent }]}>
                        +{profile.streak_count * 5} pts
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </ClayCard>
            )}

            {/* Filters */}
            <FilterBar
              selectedSizes={selectedSizes}
              onToggleSize={handleToggleSize}
              maxDistance={maxDistance}
              onChangeDistance={setMaxDistance}
              energyLevel={energyLevel}
              onChangeEnergy={setEnergyLevel}
            />

            {dogs.length > 0 && (
              <View style={styles.sectionHeader}>
                <View style={[styles.accentBar, { backgroundColor: primary }]} />
                <Text style={[styles.header, { color: text }]}>{t('dogs.nearbyDogs')}</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading && myActiveDogs.length === 0 ? (
            <EmptyState
              icon="pawprint.fill"
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
              <View style={styles.sectionHeader}>
                <View style={[styles.accentBar, { backgroundColor: primary }]} />
                <Text style={[styles.header, { color: text }]}>{t('dogs.myActiveDogs')}</Text>
              </View>
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
        <Animated.View style={[styles.fabWrapper, fabAnimStyle]}>
          <Pressable
            onPress={navigateToAddDog}
            onPressIn={() => { fabScale.value = withSpring(0.90, SPRING_IN); }}
            onPressOut={() => { fabScale.value = withSpring(1, SPRING_OUT); }}>
            <LinearGradient
              colors={[primary, primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.fab, Shadows.clayLg[0]]}>
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 16, paddingBottom: 110 },
  emptyContainer: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  accentBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
    marginRight: 10,
  },
  header: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  myDogsSection: { marginTop: 24 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  streakBlob: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9A6C30',
  },
  streakEmojiBlob: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCount: { fontSize: 36, fontWeight: '900', letterSpacing: -0.5 },
  streakLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  streakBonusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  streakPoints: { fontSize: 13, fontWeight: '700' },
  fabWrapper: {
    position: 'absolute',
    bottom: 100,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', marginTop: -2 },
  activeWalkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  bannerEmojiBlob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: { flex: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  bannerSubtitle: { color: '#FFFFFFCC', fontSize: 13, marginTop: 2 },
});
