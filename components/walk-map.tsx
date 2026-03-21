import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WalkMapProps {
  route: { lat: number; lng: number }[];
  /** Whether the map should follow the latest point (for active tracking). */
  followUser?: boolean;
  /** Show start/end markers. */
  showMarkers?: boolean;
  height?: number;
  /** Disable all map interactions (for summary display). */
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

  if (route.length === 0) {
    return <View style={[styles.placeholder, { height }]} />;
  }

  const coordinates = route.map((p) => ({ latitude: p.lat, longitude: p.lng }));
  const lastPoint = coordinates[coordinates.length - 1];
  const firstPoint = coordinates[0];

  // Calculate region to fit all points
  const lats = coordinates.map((c) => c.latitude);
  const lngs = coordinates.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const region = followUser
    ? {
        latitude: lastPoint.latitude,
        longitude: lastPoint.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.005),
        longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.005),
      };

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
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
});
