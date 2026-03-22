-- DogGO Initial Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

-- 1. profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'shelter', 'volunteer')),
  language VARCHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'bg')),
  total_points INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  last_streak_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. dogs
CREATE TABLE public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  breed VARCHAR NOT NULL,
  description TEXT,
  photo_url VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'walk' CHECK (status IN ('walk', 'adoption', 'both', 'adopted')),
  size VARCHAR NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  age VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  ar_model_url VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. walks
CREATE TABLE public.walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  distance_km DECIMAL,
  duration_mins INT,
  points_earned INT,
  multiplier DECIMAL NOT NULL DEFAULT 1.0,
  route_coordinates JSONB,
  selfie_url VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. adoption_requests
CREATE TABLE public.adoption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  walk_id UUID NOT NULL REFERENCES public.walks(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN (
    'walk_requested', 'walk_approved', 'walk_started', 'walk_completed',
    'adoption_request', 'adoption_approved', 'leaderboard_change'
  )),
  title VARCHAR NOT NULL,
  body TEXT,
  related_entity_type VARCHAR CHECK (related_entity_type IN ('walk', 'dog', 'adoption_request')),
  related_entity_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', 'User'),
    'user',
    'en'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- dogs
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dogs"
  ON public.dogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own dogs"
  ON public.dogs FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own dogs"
  ON public.dogs FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete own dogs"
  ON public.dogs FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- walks
ALTER TABLE public.walks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Walker or dog owner can view walks"
  ON public.walks FOR SELECT
  TO authenticated
  USING (
    walker_id = auth.uid()
    OR dog_id IN (SELECT id FROM public.dogs WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create walks"
  ON public.walks FOR INSERT
  TO authenticated
  WITH CHECK (walker_id = auth.uid());

CREATE POLICY "Walker or dog owner can update walks"
  ON public.walks FOR UPDATE
  TO authenticated
  USING (
    walker_id = auth.uid()
    OR dog_id IN (SELECT id FROM public.dogs WHERE owner_id = auth.uid())
  );

-- adoption_requests
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adopter or dog owner can view adoption requests"
  ON public.adoption_requests FOR SELECT
  TO authenticated
  USING (
    adopter_id = auth.uid()
    OR dog_id IN (SELECT id FROM public.dogs WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create adoption requests"
  ON public.adoption_requests FOR INSERT
  TO authenticated
  WITH CHECK (adopter_id = auth.uid());

CREATE POLICY "Dog owner can update adoption requests"
  ON public.adoption_requests FOR UPDATE
  TO authenticated
  USING (
    dog_id IN (SELECT id FROM public.dogs WHERE owner_id = auth.uid())
  );

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Dog owner can create review for completed walk"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these via Supabase Dashboard or API:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dog-photos', 'dog-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('walk-selfies', 'walk-selfies', true);
--
-- Storage policies (authenticated upload, public read):
--
-- CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'dog-photos', 'walk-selfies'));
-- CREATE POLICY "Auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('avatars', 'dog-photos', 'walk-selfies'));
-- CREATE POLICY "Owner delete" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
