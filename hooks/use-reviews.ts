import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Review } from '@/types/database';

export function useReviews() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createReview(data: {
    walkerId: string;
    walkId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    if (!user) throw new Error('User not authenticated');
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
    setIsSubmitting(true);
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          walker_id: data.walkerId,
          owner_id: user.id,
          walk_id: data.walkId,
          rating: data.rating,
          comment: data.comment ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return review as Review;
    } catch (error: unknown) {
      console.error('Error creating review:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function getReviewsForWalker(walkerId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('walker_id', walkerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Review[];
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    }
  }

  async function getReviewForWalk(walkId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('walk_id', walkId)
        .maybeSingle();

      if (error) throw error;
      return (data as Review) ?? null;
    } catch (err) {
      console.error('Error fetching review:', err);
      return null;
    }
  }

  return { createReview, getReviewsForWalker, getReviewForWalk, isSubmitting };
}
