import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { calculateTotalPoints } from '@/lib/points';
import { useStreak } from '@/hooks/use-streak';

export function useWalkMutations() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStreak } = useStreak();

  async function requestWalk(dogId: string) {
    if (!user) throw new Error('User not authenticated');
    setIsSubmitting(true);
    try {
      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .select('owner_id')
        .eq('id', dogId)
        .single();

      if (dogError) throw dogError;
      if (dog?.owner_id === user.id) throw new Error('SELF_WALK');

      const { data, error } = await supabase
        .from('walks')
        .insert({ walker_id: user.id, dog_id: dogId, status: 'requested' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error('Error requesting walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function startOwnDogWalk(dogId: string) {
    if (!user) throw new Error('User not authenticated');
    setIsSubmitting(true);
    try {
      // Reuse existing active walk if the user already has one.
      const { data: activeWalks, error: activeWalkError } = await supabase
        .from('walks')
        .select('*')
        .eq('walker_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeWalkError) throw activeWalkError;
      if (activeWalks && activeWalks.length > 0) {
        return activeWalks[0];
      }

      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .select('owner_id')
        .eq('id', dogId)
        .single();

      if (dogError) throw dogError;
      if (!dog || dog.owner_id !== user.id) throw new Error('NOT_DOG_OWNER');

      const { data, error } = await supabase
        .from('walks')
        .insert({
          walker_id: user.id,
          dog_id: dogId,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error('Error starting own dog walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function approveWalk(walkId: string) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('walks')
        .update({ status: 'approved' })
        .eq('id', walkId);
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error approving walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function rejectWalk(walkId: string) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('walks')
        .update({ status: 'cancelled' })
        .eq('id', walkId);
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error rejecting walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function startWalk(walkId: string) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('walks')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', walkId);
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error starting walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function endWalk(
    walkId: string,
    data: {
      route: Array<{ lat: number; lng: number; timestamp: number }>;
      distanceKm: number;
      durationMins: number;
      isAdoptedDog: boolean;
      selfieUrl?: string | null;
    }
  ) {
    if (!user) throw new Error('User not authenticated');
    setIsSubmitting(true);
    try {
      if (data.distanceKm < 0 || data.distanceKm > 100) {
        throw new Error('Invalid distance value');
      }
      if (data.durationMins < 0 || data.durationMins > 1440) {
        throw new Error('Invalid duration value');
      }

      const { basePoints, multiplier, totalPoints } = calculateTotalPoints(
        data.distanceKm,
        data.durationMins,
        data.isAdoptedDog
      );

      // Update walk record
      const { error: walkError } = await supabase
        .from('walks')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          distance_km: data.distanceKm,
          duration_mins: data.durationMins,
          route_coordinates: data.route,
          points_earned: totalPoints,
          multiplier,
          selfie_url: data.selfieUrl ?? null,
        })
        .eq('id', walkId);

      if (walkError) throw walkError;

      // Add points to walker profile
      const { error: pointsError } = await supabase.rpc('increment_points', {
        user_id: user.id,
        points_to_add: totalPoints,
      });

      if (pointsError) throw pointsError;

      // Update streak (first walk of the day increments streak + awards bonus)
      const streakResult = await updateStreak();

      return { basePoints, multiplier, totalPoints, streakBonus: streakResult?.bonus_points ?? 0 };
    } catch (error: unknown) {
      console.error('Error ending walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function cancelWalk(walkId: string) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('walks')
        .update({ status: 'cancelled' })
        .eq('id', walkId);
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error cancelling walk:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    requestWalk,
    startOwnDogWalk,
    approveWalk,
    rejectWalk,
    startWalk,
    endWalk,
    cancelWalk,
    isSubmitting,
  };
}
