import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Dog, DogSize, EnergyLevel } from '@/types/database';
import { calculateDistance } from '@/lib/location';

export interface AdoptionDog extends Dog {
  distance: number | null;
}

export function useAdoptionDogs(
  userLat: number | null,
  userLon: number | null,
  selectedSizes?: DogSize[],
  maxDistance?: number | null,
  energyLevel?: EnergyLevel | null,
) {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<AdoptionDog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = useCallback(async () => {
    if (!user) { setDogs([]); setIsLoading(false); return; }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('dogs')
        .select('*')
        .in('status', ['adoption', 'both'])
        .neq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedSizes && selectedSizes.length > 0) {
        query = query.in('size', selectedSizes);
      }

      if (energyLevel) {
        query = query.eq('energy_level', energyLevel);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const result: AdoptionDog[] = (data ?? []).map((dog) => {
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

      const filtered = maxDistance != null
        ? result.filter((d) => d.distance == null || d.distance <= maxDistance)
        : result;

      setDogs(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch adoption dogs';
      setError(message);
      setDogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, userLat, userLon, selectedSizes, maxDistance, energyLevel]);

  useEffect(() => {
    let cancelled = false;
    fetchDogs().then(() => { if (cancelled) { /* unmounted */ } });
    return () => { cancelled = true; };
  }, [fetchDogs]);

  return { dogs, isLoading, error, refresh: fetchDogs };
}
