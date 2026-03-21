import { useEffect, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { calculateDistance } from '@/lib/location';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface TrackingState {
  isTracking: boolean;
  route: RoutePoint[];
  distanceKm: number;
  durationMins: number;
  currentSpeed: number;
  startedAt: Date | null;
}

export function useWalkTracking() {
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    route: [],
    distanceKm: 0,
    durationMins: 0,
    currentSpeed: 0,
    startedAt: null,
  });

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeRef = useRef<RoutePoint[]>([]);
  const distanceRef = useRef(0);

  const updateDuration = useCallback(() => {
    setState((prev) => {
      if (!prev.startedAt) return prev;
      const elapsed = (Date.now() - prev.startedAt.getTime()) / 60000;
      return { ...prev, durationMins: Math.round(elapsed * 10) / 10 };
    });
  }, []);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    routeRef.current = [];
    distanceRef.current = 0;

    const startedAt = new Date();

    setState({
      isTracking: true,
      route: [],
      distanceKm: 0,
      durationMins: 0,
      currentSpeed: 0,
      startedAt,
    });

    // Update duration every second
    timerRef.current = setInterval(updateDuration, 1000);

    // Watch position every ~5 seconds
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
      },
      (location) => {
        const point: RoutePoint = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: Date.now(),
        };

        const prev = routeRef.current;
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const segmentDist = calculateDistance(last.lat, last.lng, point.lat, point.lng);
          distanceRef.current += segmentDist;
        }

        routeRef.current = [...prev, point];

        const speed = location.coords.speed;

        setState((s) => ({
          ...s,
          route: routeRef.current,
          distanceKm: Math.round(distanceRef.current * 100) / 100,
          currentSpeed: speed != null && speed >= 0 ? Math.round(speed * 3.6 * 10) / 10 : 0,
        }));
      }
    );
  }, [updateDuration]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState((prev) => ({ ...prev, isTracking: false }));

    return {
      route: routeRef.current,
      distanceKm: distanceRef.current,
      durationMins: state.startedAt
        ? Math.round((Date.now() - state.startedAt.getTime()) / 60000)
        : 0,
    };
  }, [state.startedAt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchRef.current) watchRef.current.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
}
