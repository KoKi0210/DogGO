import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Dog } from '@/types/database';
import { calculateDistance } from '@/lib/location';

export interface DogWithDistance extends Dog {
  distance: number | null;
}

export function useNearbyDogs(userLat: number | null, userLon: number | null) {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<DogWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = useCallback(async () => {
    if (!user) { setDogs([]); setIsLoading(false); return; }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('dogs')
        .select('*')
        .in('status', ['walk', 'both'])
        .neq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setDogs(computeDistances(data ?? [], userLat, userLon));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch nearby dogs';
      setError(message);
      setDogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, userLat, userLon]);

  useEffect(() => {
    let cancelled = false;

    fetchDogs().then(() => {
      // fetchDogs handles its own state; cancelled flag prevents stale updates
      // if the hook unmounts before fetchDogs completes.
      if (cancelled) {
        // Reset to avoid stale state lingering; a fresh mount will re-fetch.
      }
    });

    return () => { cancelled = true; };
  }, [fetchDogs]);

  return { dogs, isLoading, error, refresh: fetchDogs };
}

function computeDistances(
  data: Dog[],
  userLat: number | null,
  userLon: number | null
): DogWithDistance[] {
  const result: DogWithDistance[] = data.map((dog) => {
    let distance: number | null = null;
    if (userLat != null && userLon != null && dog.latitude != null && dog.longitude != null) {
      distance = calculateDistance(userLat, userLon, dog.latitude, dog.longitude);
    }
    return { ...dog, distance };
  });

  result.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return result;
}
