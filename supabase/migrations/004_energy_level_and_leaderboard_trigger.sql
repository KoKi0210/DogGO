-- ============================================================
-- Migration 004: energy_level column + leaderboard notification trigger
-- ============================================================

-- 1. Add energy_level column to dogs table
ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS energy_level VARCHAR
  CHECK (energy_level IN ('low', 'medium', 'high'));

-- 2. Leaderboard change notification trigger
--    Fires after total_points is updated on a profile.
--    If the user's rank improved and they are in the top 10,
--    insert a leaderboard_change notification.

CREATE OR REPLACE FUNCTION public.notify_leaderboard_change()
RETURNS TRIGGER AS $$
DECLARE
  new_rank INT;
  old_rank INT;
BEGIN
  SELECT COUNT(*) + 1 INTO new_rank
  FROM public.profiles
  WHERE total_points > NEW.total_points AND id != NEW.id;

  SELECT COUNT(*) + 1 INTO old_rank
  FROM public.profiles
  WHERE total_points > OLD.total_points AND id != OLD.id;

  IF new_rank <= 10 AND new_rank < old_rank THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      NEW.id,
      'leaderboard_change',
      'Leaderboard Update',
      'You moved to rank #' || new_rank || ' on the all-time leaderboard!'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_leaderboard_change ON public.profiles;

CREATE TRIGGER trg_leaderboard_change
AFTER UPDATE OF total_points ON public.profiles
FOR EACH ROW
WHEN (NEW.total_points IS DISTINCT FROM OLD.total_points)
EXECUTE FUNCTION public.notify_leaderboard_change();
