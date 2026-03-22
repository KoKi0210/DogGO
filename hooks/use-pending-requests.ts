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

      // Get walks for dogs owned by the current user that are in 'requested' status
      const { data, error } = await supabase
        .from('walks')
        .select('*, dog:dogs(*)')
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter to only walks for dogs owned by this user
      const walks = (data ?? []) as unknown as PendingWalkRequest[];
      const myPendingWalks = walks.filter((w) => w.dog && w.dog.owner_id === user.id);
      setPendingWalks(myPendingWalks);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setPendingWalks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    fetchPending().then(() => { if (cancelled) { /* unmounted */ } });
    return () => { cancelled = true; };
  }, [fetchPending]);

  return { pendingWalks, isLoading, refresh: fetchPending };
}
