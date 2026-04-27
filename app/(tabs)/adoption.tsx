import { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAdoptionDogs, AdoptionDog } from '@/hooks/use-adoption-dogs';
import { getCurrentLocation } from '@/lib/location';
import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { FilterBar } from '@/components/filter-bar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DogSize, EnergyLevel } from '@/types/database';

export default function AdoptionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');

  const surfacePrimary = useThemeColor({}, 'surfacePrimary');

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

  const { dogs, isLoading, refresh } = useAdoptionDogs(userLat, userLon, selectedSizes, maxDistance, energyLevel);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleToggleSize = useCallback((size: DogSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: AdoptionDog }) => (
    <DogCard
      dog={item}
      distance={item.distance}
      showStatusBadge
      onPress={() => router.push(`/dog/${item.id}`)}
    />
  ), [router]);

  const keyExtractor = useCallback((item: AdoptionDog) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <FlatList
        data={dogs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={dogs.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          <View>
            {/* Decorative hero blob */}
            <View style={styles.heroArea}>
              <View style={[styles.heroBlob, { backgroundColor: surfacePrimary }]}>
                <IconSymbol name="heart.fill" size={40} color={primary} />
              </View>
            </View>

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
                <Text style={[styles.header, { color: text }]}>{t('adoption.availableDogs')}</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="heart.fill"
              title={t('adoption.noAdoptions')}
              message={t('adoption.noAdoptionsMessage')}
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
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 60, paddingBottom: 110 },
  emptyContainer: { flex: 1 },
  heroArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBlob: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accentBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
    marginRight: 10,
  },
  header: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
});
