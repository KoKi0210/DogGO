import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Walk, Dog } from '@/types/database';

export interface WalkHistoryItem extends Walk {
  dog: Dog | null;
}

export function useMyWalks() {
  const { user } = useAuth();
  const [walks, setWalks] = useState<WalkHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalks = useCallback(async () => {
    if (!user) {
      setWalks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('walks')
        .select('*, dog:dogs(*)')
        .eq('walker_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setWalks((data as WalkHistoryItem[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch walks';
      setError(message);
      console.error('Error fetching walks:', err);
      setWalks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWalks();
  }, [fetchWalks]);

  return { walks, isLoading, error, refresh: fetchWalks };
}
