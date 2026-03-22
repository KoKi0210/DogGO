import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Walk, Dog, Profile } from '@/types/database';

export interface WalkWithDetails extends Walk {
  dog: Dog | null;
  walker: Profile | null;
  owner: Profile | null;
}

export function useWalk(walkId: string) {
  const [walk, setWalk] = useState<WalkWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalk = useCallback(async () => {
    if (!walkId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('walks')
        .select('*, dog:dogs(*, owner:profiles(*)), walker:profiles(*)')
        .eq('id', walkId)
        .single();

      if (queryError) throw queryError;

      const raw = data as Walk & {
        dog: (Dog & { owner: Profile | null }) | null;
        walker: Profile | null;
      };

      setWalk({
        ...raw,
        dog: raw.dog ? { ...raw.dog, owner: undefined } as unknown as Dog : null,
        walker: raw.walker,
        owner: raw.dog?.owner ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch walk';
      setError(message);
      console.error('Error fetching walk:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walkId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!walkId) { setIsLoading(false); return; }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('walks')
          .select('*, dog:dogs(*, owner:profiles(*)), walker:profiles(*)')
          .eq('id', walkId)
          .single();

        if (cancelled) return;
        if (queryError) throw queryError;

        const raw = data as Walk & {
          dog: (Dog & { owner: Profile | null }) | null;
          walker: Profile | null;
        };

        setWalk({
          ...raw,
          dog: raw.dog ? { ...raw.dog, owner: undefined } as unknown as Dog : null,
          walker: raw.walker,
          owner: raw.dog?.owner ?? null,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch walk';
        setError(message);
        console.error('Error fetching walk:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [walkId]);

  return { walk, isLoading, error, refresh: fetchWalk };
}
