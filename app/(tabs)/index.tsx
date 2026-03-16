import { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNearbyDogs, DogWithDistance } from '@/hooks/use-nearby-dogs';
import { getCurrentLocation } from '@/lib/location';
import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { HEADER_TOP_PADDING } from '@/constants/layout';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');

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

  // Refresh dogs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = useCallback(({ item }: { item: DogWithDistance }) => (
    <DogCard
      dog={item}
      distance={item.distance}
      onPress={() => router.push(`/dog/${item.id}`)}
    />
  ), [router]);

  const keyExtractor = useCallback((item: DogWithDistance) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <FlatList
        data={dogs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={dogs.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          dogs.length > 0 ? (
            <Text style={[styles.header, { color: text }]}>{t('dogs.nearbyDogs')}</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="🐕"
              title={t('dogs.noDogs')}
              message={t('dogs.noDogsMessage')}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingTop: HEADER_TOP_PADDING,
  },
  emptyContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
