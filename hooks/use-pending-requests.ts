import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Walk, Dog } from '@/types/database';

export interface PendingWalkRequest extends Walk {
  dog: Dog | null;
}

export function usePendingRequests() {
  const { user } = useAuth();
  const [pendingWalks, setPendingWalks] = useState<PendingWalkRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    if (!user) { setPendingWalks([]); setIsLoading(false); return; }

    try {
      setIsLoading(true);

      const { data: myDogs } = await supabase
        .from('dogs')
        .select('id')
        .eq('owner_id', user.id);

      const myDogIds = (myDogs ?? []).map((d: { id: string }) => d.id);

      if (myDogIds.length === 0) {
        setPendingWalks([]);
        return;
      }

      const { data, error } = await supabase
        .from('walks')
        .select('*, dog:dogs(*)')
        .eq('status', 'requested')
        .in('dog_id', myDogIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingWalks((data ?? []) as unknown as PendingWalkRequest[]);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setPendingWalks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    fetchPending().then(() => { if (cancelled) { } });
    return () => { cancelled = true; };
  }, [fetchPending]);

  return { pendingWalks, isLoading, refresh: fetchPending };
}
