import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Dog, Profile } from '@/types/database';

export function useDog(dogId: string) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDog = useCallback(async () => {
    if (!dogId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('dogs')
        .select('*, owner:profiles(*)')
        .eq('id', dogId)
        .single();

      if (queryError) throw queryError;

      const { owner: ownerData, ...dogData } = data as Dog & { owner: Profile | null };
      setDog(dogData);
      setOwner(ownerData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dog';
      setError(message);
      console.error('Error fetching dog:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!dogId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('dogs')
          .select('*, owner:profiles(*)')
          .eq('id', dogId)
          .single();

        if (cancelled) return;
        if (queryError) throw queryError;

        const { owner: ownerData, ...dogData } = data as Dog & { owner: Profile | null };
        setDog(dogData);
        setOwner(ownerData);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch dog';
        setError(message);
        console.error('Error fetching dog:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dogId]);

  return { dog, owner, isLoading, error, refresh: fetchDog };
}
