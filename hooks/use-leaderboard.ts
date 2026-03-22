import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LeaderboardEntry } from '@/types/database';

export function useLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'allTime') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rpcPeriod = period === 'allTime' ? 'all_time' : period;

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_leaderboard', {
        period: rpcPeriod,
        max_results: 50,
      });

      if (rpcError) throw rpcError;
      setEntries((data ?? []) as LeaderboardEntry[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(message);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [rpcPeriod]);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard().then(() => { if (cancelled) { /* unmounted */ } });
    return () => { cancelled = true; };
  }, [fetchLeaderboard]);

  return { entries, isLoading, error, refresh: fetchLeaderboard };
}
