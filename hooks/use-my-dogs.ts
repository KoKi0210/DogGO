import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Dog } from '@/types/database';

export function useMyDogs() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
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
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setDogs(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dogs';
      setError(message);
      setDogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    fetchDogs().then(() => {
      if (cancelled) {
      }
    });

    return () => { cancelled = true; };
  }, [fetchDogs]);

  return { dogs, isLoading, error, refresh: fetchDogs };
}
