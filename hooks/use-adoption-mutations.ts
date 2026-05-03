import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

export function useAdoptionMutations() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestAdoption(dogId: string) {
    if (!user) throw new Error('User not authenticated');
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('adoption_requests')
        .insert({ dog_id: dogId, adopter_id: user.id })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error('ALREADY_REQUESTED');
        }
        throw error;
      }
      return data;
    } catch (error: unknown) {
      console.error('Error requesting adoption:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function approveAdoption(requestId: string) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('approve_adoption', {
        request_id: requestId,
      });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error approving adoption:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function rejectAdoption(requestId: string) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('adoption_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error rejecting adoption:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { requestAdoption, approveAdoption, rejectAdoption, isSubmitting };
}
