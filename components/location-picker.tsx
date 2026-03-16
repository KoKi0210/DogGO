import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCurrentLocation } from '@/lib/location';
import { Button } from './button';
import { MAP } from '@/constants/layout';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

function createRegion(lat: number, lon: number, delta: number): Region {
  return {
    latitude: lat,
    longitude: lon,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const { t } = useTranslation();
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [region, setRegion] = useState<Region>(
    createRegion(
      latitude ?? MAP.DEFAULT_LATITUDE,
      longitude ?? MAP.DEFAULT_LONGITUDE,
      MAP.OVERVIEW_DELTA
    )
  );

  const [markerCoord, setMarkerCoord] = useState<{ latitude: number; longitude: number } | null>(
    latitude != null && longitude != null ? { latitude, longitude } : null
  );

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setRegion(createRegion(latitude, longitude, MAP.DETAIL_DELTA));
      setMarkerCoord({ latitude, longitude });
    }
  }, [latitude, longitude]);

  async function handleUseCurrentLocation() {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        onChange(location.latitude, location.longitude);
        setRegion(createRegion(location.latitude, location.longitude, MAP.DETAIL_DELTA));
        setMarkerCoord(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }

  function handleMapPress(event: MapPressEvent) {
    const { latitude: lat, longitude: lon } = event.nativeEvent.coordinate;
    onChange(lat, lon);
    setMarkerCoord({ latitude: lat, longitude: lon });
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.location')}</Text>
      <Text style={[styles.hint, { color: textSecondary }]}>{t('dogs.locationHint')}</Text>

      <View style={styles.buttonRow}>
        <Button
          title={t('dogs.useCurrentLocation')}
          onPress={handleUseCurrentLocation}
          loading={isLoadingLocation}
          style={styles.buttonHalf}
        />
      </View>

      <View style={[styles.mapContainer, { borderColor: border }]}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          onRegionChangeComplete={setRegion}>
          {markerCoord && <Marker coordinate={markerCoord} draggable />}
        </MapView>
        <Text style={[styles.mapHint, { color: textSecondary }]}>
          {t('dogs.tapToPlacePin')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  hint: {
    fontSize: 12,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  map: {
    height: 200,
  },
  mapHint: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
