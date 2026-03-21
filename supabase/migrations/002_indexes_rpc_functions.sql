-- DogGO Phase A: Indexes, RPC Functions, and Schema Updates
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

-- ============================================================
-- INDEXES on FK columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON public.dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_walks_walker_id ON public.walks(walker_id);
CREATE INDEX IF NOT EXISTS idx_walks_dog_id ON public.walks(dog_id);
CREATE INDEX IF NOT EXISTS idx_walks_status ON public.walks(status);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_dog_id ON public.adoption_requests(dog_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_adopter_id ON public.adoption_requests(adopter_id);
CREATE INDEX IF NOT EXISTS idx_reviews_walker_id ON public.reviews(walker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_walk_id ON public.reviews(walk_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- ============================================================
-- SCHEMA UPDATES
-- ============================================================

-- Push token for notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token VARCHAR;

-- Prevent duplicate adoption requests (one active request per adopter per dog)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_adoption
  ON public.adoption_requests(dog_id, adopter_id)
  WHERE status != 'rejected';

-- ============================================================
-- RPC: increment_points
-- Atomically add points to a user's profile.
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_points(
  user_id UUID,
  points_to_add INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = total_points + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: get_leaderboard
-- Returns top walkers by points earned within a given period.
-- period: 'daily', 'weekly', 'monthly', 'all_time'
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  period TEXT DEFAULT 'all_time',
  max_results INT DEFAULT 50
)
RETURNS TABLE(
  user_id UUID,
  display_name VARCHAR,
  avatar_url VARCHAR,
  points BIGINT,
  rank BIGINT
) AS $$
DECLARE
  start_date TIMESTAMPTZ;
BEGIN
  IF period = 'daily' THEN
    start_date := date_trunc('day', now());
  ELSIF period = 'weekly' THEN
    start_date := date_trunc('week', now());
  ELSIF period = 'monthly' THEN
    start_date := date_trunc('month', now());
  ELSE
    start_date := '1970-01-01'::TIMESTAMPTZ;
  END IF;

  RETURN QUERY
  SELECT
    w.walker_id AS user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(SUM(w.points_earned), 0)::BIGINT AS points,
    RANK() OVER (ORDER BY COALESCE(SUM(w.points_earned), 0) DESC)::BIGINT AS rank
  FROM public.walks w
  JOIN public.profiles p ON p.id = w.walker_id
  WHERE w.status = 'completed'
    AND w.ended_at >= start_date
  GROUP BY w.walker_id, p.display_name, p.avatar_url
  HAVING COALESCE(SUM(w.points_earned), 0) > 0
  ORDER BY points DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: approve_adoption
-- Atomically: approve request, transfer ownership, reject others,
-- award bonus points. Uses SECURITY DEFINER to bypass RLS on dogs.
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_adoption(
  request_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_dog_id UUID;
  v_adopter_id UUID;
  v_owner_id UUID;
  v_adoption_bonus INT := 500;
BEGIN
  -- Get request details
  SELECT ar.dog_id, ar.adopter_id
  INTO v_dog_id, v_adopter_id
  FROM public.adoption_requests ar
  WHERE ar.id = request_id AND ar.status = 'pending';

  IF v_dog_id IS NULL THEN
    RAISE EXCEPTION 'Adoption request not found or not pending';
  END IF;

  -- Verify caller is the dog owner
  SELECT d.owner_id INTO v_owner_id
  FROM public.dogs d
  WHERE d.id = v_dog_id;

  IF v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the dog owner can approve adoption requests';
  END IF;

  -- 1. Approve this request
  UPDATE public.adoption_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;

  -- 2. Transfer dog ownership and mark as adopted
  UPDATE public.dogs
  SET owner_id = v_adopter_id, status = 'adopted'
  WHERE id = v_dog_id;

  -- 3. Reject all other pending requests for this dog
  UPDATE public.adoption_requests
  SET status = 'rejected', updated_at = now()
  WHERE dog_id = v_dog_id AND id != request_id AND status = 'pending';

  -- 4. Award adoption bonus points to adopter (if not already awarded)
  UPDATE public.adoption_requests
  SET points_awarded = true
  WHERE id = request_id AND points_awarded = false;

  IF FOUND THEN
    UPDATE public.profiles
    SET total_points = total_points + v_adoption_bonus
    WHERE id = v_adopter_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: update_streak
-- Updates the user's streak count based on last_streak_date.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_streak(
  user_id UUID
)
RETURNS TABLE(new_streak INT, bonus_points INT) AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
  v_streak INT;
  v_bonus INT := 0;
  v_streak_per_day INT := 5;
BEGIN
  SELECT p.streak_count, p.last_streak_date
  INTO v_streak, v_last_date
  FROM public.profiles p
  WHERE p.id = user_id;

  IF v_last_date = v_today THEN
    -- Already walked today
    RETURN QUERY SELECT v_streak, 0;
    RETURN;
  END IF;

  IF v_last_date = v_today - 1 THEN
    -- Consecutive day
    v_streak := v_streak + 1;
  ELSE
    -- Streak broken or first walk
    v_streak := 1;
  END IF;

  v_bonus := v_streak * v_streak_per_day;

  UPDATE public.profiles
  SET streak_count = v_streak,
      last_streak_date = v_today,
      total_points = total_points + v_bonus
  WHERE id = user_id;

  RETURN QUERY SELECT v_streak, v_bonus;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
