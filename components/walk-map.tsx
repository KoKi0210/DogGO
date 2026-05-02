import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WalkMapProps {
  route: { lat: number; lng: number }[];
  followUser?: boolean;
  showMarkers?: boolean;
  height?: number;
  scrollEnabled?: boolean;
}

export function WalkMap({
  route,
  followUser = false,
  showMarkers = true,
  height = 250,
  scrollEnabled = true,
}: WalkMapProps) {
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');
  const placeholder = useThemeColor({}, 'placeholder');

  if (route.length === 0) {
    return <View style={[styles.placeholder, { height, backgroundColor: placeholder }]} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { coordinates, region, firstPoint, lastPoint } = useMemo(() => {
    const coords = route.map((p) => ({ latitude: p.lat, longitude: p.lng }));
    const last = coords[coords.length - 1];
    const first = coords[0];

    const lats = coords.map((c) => c.latitude);
    const lngs = coords.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const reg = followUser
      ? {
          latitude: last.latitude,
          longitude: last.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }
      : {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.005),
          longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.005),
        };

    return { coordinates: coords, region: reg, firstPoint: first, lastPoint: last };
  }, [route, followUser]);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        region={region}
        scrollEnabled={scrollEnabled}
        zoomEnabled={scrollEnabled}
        rotateEnabled={false}
      >
        <Polyline coordinates={coordinates} strokeColor={primary} strokeWidth={4} />
        {showMarkers && coordinates.length > 1 && (
          <>
            <Marker coordinate={firstPoint} pinColor={accent} title="Start" />
            <Marker coordinate={lastPoint} pinColor={primary} title="End" />
          </>
        )}
        {showMarkers && coordinates.length === 1 && (
          <Marker coordinate={firstPoint} pinColor={primary} />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  placeholder: {
    borderRadius: 12,
  },
});
