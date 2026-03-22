import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { StreakResult } from '@/types/database';

export function useStreak() {
  const { user } = useAuth();

  const updateStreak = useCallback(async (): Promise<StreakResult | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('update_streak', {
        user_id: user.id,
      });

      if (error) {
        console.error('Streak RPC failed, using fallback:', error);
        return fallbackUpdateStreak(user.id);
      }

      const result = (data as StreakResult[])?.[0];
      return result ?? null;
    } catch (err) {
      console.error('Error updating streak:', err);
      return null;
    }
  }, [user]);

  return { updateStreak };
}

async function fallbackUpdateStreak(userId: string): Promise<StreakResult | null> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, last_streak_date, total_points')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile.last_streak_date as string | null;

    if (lastDate === today) {
      return { new_streak: profile.streak_count as number, bonus_points: 0 };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak: number;

    if (lastDate === yesterday) {
      newStreak = (profile.streak_count as number) + 1;
    } else {
      newStreak = 1;
    }

    const bonusPoints = newStreak * 5;
    const currentPoints = (profile.total_points as number) ?? 0;

    await supabase
      .from('profiles')
      .update({
        streak_count: newStreak,
        last_streak_date: today,
        total_points: currentPoints + bonusPoints,
      })
      .eq('id', userId);

    return { new_streak: newStreak, bonus_points: bonusPoints };
  } catch (err) {
    console.error('Fallback streak update failed:', err);
    return null;
  }
}
