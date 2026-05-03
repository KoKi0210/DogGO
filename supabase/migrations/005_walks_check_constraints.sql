ALTER TABLE public.walks
  ADD CONSTRAINT walks_distance_km_range
    CHECK (distance_km IS NULL OR (distance_km >= 0 AND distance_km <= 100));

ALTER TABLE public.walks
  ADD CONSTRAINT walks_duration_mins_range
    CHECK (duration_mins IS NULL OR (duration_mins >= 0 AND duration_mins <= 1440));

ALTER TABLE public.walks
  ADD CONSTRAINT walks_points_earned_range
    CHECK (points_earned IS NULL OR (points_earned >= 0 AND points_earned <= 5000));

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_range
    CHECK (rating >= 1 AND rating <= 5);
