import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { AdoptionRequest, Dog, Profile } from '@/types/database';

export interface AdoptionRequestWithDetails extends AdoptionRequest {
  dog: Dog | null;
  adopter: Profile | null;
}

export function useAdoptionRequests() {
  const { user } = useAuth();
  const [sent, setSent] = useState<AdoptionRequestWithDetails[]>([]);
  const [received, setReceived] = useState<AdoptionRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setSent([]);
      setReceived([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Sent by me
      const { data: sentData } = await supabase
        .from('adoption_requests')
        .select('*, dog:dogs(*), adopter:profiles(*)')
        .eq('adopter_id', user.id)
        .order('created_at', { ascending: false });

      // Get IDs of dogs owned by this user
      const { data: myDogs } = await supabase
        .from('dogs')
        .select('id')
        .eq('owner_id', user.id);

      const myDogIds = (myDogs ?? []).map((d: { id: string }) => d.id);

      // Received (dogs I own)
      let receivedItems: AdoptionRequestWithDetails[] = [];
      if (myDogIds.length > 0) {
        const { data: receivedData } = await supabase
          .from('adoption_requests')
          .select('*, dog:dogs(*), adopter:profiles(*)')
          .in('dog_id', myDogIds)
          .neq('adopter_id', user.id)
          .order('created_at', { ascending: false });

        receivedItems = (receivedData ?? []) as unknown as AdoptionRequestWithDetails[];
      }

      const sentItems = (sentData ?? []) as unknown as AdoptionRequestWithDetails[];

      setSent(sentItems);
      setReceived(receivedItems);
    } catch (err) {
      console.error('Error fetching adoption requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    fetchRequests().then(() => { if (cancelled) { /* unmounted */ } });
    return () => { cancelled = true; };
  }, [fetchRequests]);

  return { sent, received, isLoading, refresh: fetchRequests };
}
