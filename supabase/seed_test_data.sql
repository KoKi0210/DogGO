DO $$
DECLARE
  user_a UUID := '6a415ddb-1293-4ed3-ad4d-1677bdeb3090';
  user_b UUID := '5c7380ea-baf9-463c-85bd-f2e7610140f4';
  dog_buddy   UUID := gen_random_uuid();
  dog_luna    UUID := gen_random_uuid();
  dog_max     UUID := gen_random_uuid();
  dog_rocky   UUID := gen_random_uuid();
  dog_bella   UUID := gen_random_uuid();
  dog_bailey  UUID := gen_random_uuid();
  walk_1 UUID := gen_random_uuid();
  walk_2 UUID := gen_random_uuid();
  walk_3 UUID := gen_random_uuid();
  walk_4 UUID := gen_random_uuid();
  walk_5 UUID := gen_random_uuid();
  walk_6 UUID := gen_random_uuid();
  adopt_1 UUID := gen_random_uuid();
  adopt_2 UUID := gen_random_uuid();
  review_1 UUID := gen_random_uuid();
  review_2 UUID := gen_random_uuid();

BEGIN

  UPDATE public.profiles SET
    display_name = 'Иван Петров',
    total_points = 1850,
    streak_count = 7,
    last_streak_date = CURRENT_DATE
  WHERE id = user_a;

  UPDATE public.profiles SET
    display_name = 'Мария Димитрова',
    total_points = 920,
    streak_count = 3,
    last_streak_date = CURRENT_DATE
  WHERE id = user_b;
  INSERT INTO public.dogs (id, owner_id, name, breed, description, status, size, age, latitude, longitude)
  VALUES
    (dog_buddy, user_a, 'Buddy', 'Golden Retriever',
     'Friendly and energetic, loves long walks in the park.',
     'walk', 'large', '3 years', 42.6977, 23.3219),

    (dog_luna, user_a, 'Luna', 'Cocker Spaniel',
     'Sweet and gentle. Looking for a loving forever home.',
     'adoption', 'medium', '2 years', 42.6950, 23.3280),

    (dog_max, user_a, 'Max', 'Chihuahua',
     'Tiny but brave! Available for walks and adoption.',
     'both', 'small', '4 years', 42.6990, 23.3150);
  INSERT INTO public.dogs (id, owner_id, name, breed, description, status, size, age, latitude, longitude)
  VALUES
    (dog_rocky, user_b, 'Rocky', 'German Shepherd',
     'Well-trained and protective. Great walking companion.',
     'walk', 'large', '5 years', 42.6930, 23.3350),

    (dog_bella, user_b, 'Bella', 'Labrador Mix',
     'Playful and loves children. Available for walks and adoption.',
     'both', 'medium', '1 year', 42.7010, 23.3190),
    (dog_bailey, user_a, 'Bailey', 'Poodle',
     'Recently adopted! Adjusting well to the new home.',
     'adopted', 'small', '2 years', 42.6965, 23.3240);
  INSERT INTO public.walks (id, walker_id, dog_id, status, started_at, ended_at, distance_km, duration_mins, points_earned, multiplier, route_coordinates)
  VALUES (
    walk_1, user_b, dog_buddy, 'completed',
    now() - interval '2 days 1 hour',
    now() - interval '2 days',
    2.4, 38, 74, 1.0,
    '[
      {"lat": 42.6977, "lng": 23.3219, "timestamp": 1},
      {"lat": 42.6985, "lng": 23.3230, "timestamp": 300},
      {"lat": 42.6995, "lng": 23.3250, "timestamp": 600},
      {"lat": 42.7005, "lng": 23.3265, "timestamp": 900},
      {"lat": 42.7015, "lng": 23.3260, "timestamp": 1200},
      {"lat": 42.7010, "lng": 23.3240, "timestamp": 1500},
      {"lat": 42.6995, "lng": 23.3225, "timestamp": 1800},
      {"lat": 42.6980, "lng": 23.3220, "timestamp": 2100}
    ]'::jsonb
  );
  INSERT INTO public.walks (id, walker_id, dog_id, status, started_at, ended_at, distance_km, duration_mins, points_earned, multiplier, route_coordinates)
  VALUES (
    walk_2, user_a, dog_rocky, 'completed',
    now() - interval '1 day 2 hours',
    now() - interval '1 day 1 hour',
    3.1, 52, 106, 1.0,
    '[
      {"lat": 42.6930, "lng": 23.3350, "timestamp": 1},
      {"lat": 42.6940, "lng": 23.3370, "timestamp": 400},
      {"lat": 42.6955, "lng": 23.3390, "timestamp": 800},
      {"lat": 42.6970, "lng": 23.3400, "timestamp": 1200},
      {"lat": 42.6980, "lng": 23.3385, "timestamp": 1600},
      {"lat": 42.6975, "lng": 23.3360, "timestamp": 2000},
      {"lat": 42.6960, "lng": 23.3345, "timestamp": 2400},
      {"lat": 42.6940, "lng": 23.3340, "timestamp": 2800},
      {"lat": 42.6930, "lng": 23.3350, "timestamp": 3100}
    ]'::jsonb
  );
  INSERT INTO public.walks (id, walker_id, dog_id, status, started_at, ended_at, distance_km, duration_mins, points_earned, multiplier, route_coordinates)
  VALUES (
    walk_3, user_b, dog_bailey, 'completed',
    now() - interval '3 days 30 minutes',
    now() - interval '3 days',
    1.8, 25, 57, 1.5,
    '[
      {"lat": 42.6965, "lng": 23.3240, "timestamp": 1},
      {"lat": 42.6975, "lng": 23.3255, "timestamp": 350},
      {"lat": 42.6985, "lng": 23.3260, "timestamp": 700},
      {"lat": 42.6980, "lng": 23.3245, "timestamp": 1050},
      {"lat": 42.6970, "lng": 23.3235, "timestamp": 1400}
    ]'::jsonb
  );
  INSERT INTO public.walks (id, walker_id, dog_id, status, started_at, distance_km, duration_mins, multiplier, route_coordinates)
  VALUES (
    walk_4, user_a, dog_bella, 'active',
    now() - interval '15 minutes',
    0.6, NULL, 1.0,
    '[
      {"lat": 42.7010, "lng": 23.3190, "timestamp": 1},
      {"lat": 42.7015, "lng": 23.3200, "timestamp": 300},
      {"lat": 42.7020, "lng": 23.3215, "timestamp": 600}
    ]'::jsonb
  );
  INSERT INTO public.walks (id, walker_id, dog_id, status, multiplier)
  VALUES (walk_5, user_b, dog_max, 'approved', 1.0);
  INSERT INTO public.walks (id, walker_id, dog_id, status, multiplier)
  VALUES (walk_6, user_a, dog_rocky, 'requested', 1.0);
  INSERT INTO public.adoption_requests (id, dog_id, adopter_id, status, points_awarded, created_at, updated_at)
  VALUES (
    adopt_1, dog_bailey, user_a, 'approved', true,
    now() - interval '10 days',
    now() - interval '9 days'
  );
  INSERT INTO public.adoption_requests (id, dog_id, adopter_id, status, points_awarded)
  VALUES (adopt_2, dog_luna, user_b, 'pending', false);
  INSERT INTO public.reviews (id, walker_id, owner_id, walk_id, rating, comment)
  VALUES (
    review_1, user_b, user_a, walk_1,
    5, 'Мария беше страхотна с Buddy! Ще я поканим отново.'
  );
  INSERT INTO public.reviews (id, walker_id, owner_id, walk_id, rating, comment)
  VALUES (
    review_2, user_a, user_b, walk_2,
    4, 'Ivan took great care of Rocky. Very responsible walker.'
  );
  INSERT INTO public.notifications (user_id, type, title, body, related_entity_type, related_entity_id, read, created_at)
  VALUES
    (user_a, 'walk_requested', 'Walk Request', 'Мария wants to walk your dog Max.', 'walk', walk_5, true, now() - interval '5 hours'),
    (user_a, 'walk_completed', 'Walk Completed', 'Мария completed a walk with Buddy. Leave a review!', 'walk', walk_1, true, now() - interval '2 days'),
    (user_a, 'adoption_request', 'Adoption Request', 'Мария wants to adopt Luna.', 'adoption_request', adopt_2, false, now() - interval '1 hour'),
    (user_a, 'adoption_approved', 'Adoption Approved', 'Your adoption of Bailey has been approved! +500 points!', 'adoption_request', adopt_1, true, now() - interval '9 days'),
    (user_a, 'leaderboard_change', 'Leaderboard Update', 'You moved up to #1 on the leaderboard!', NULL, NULL, false, now() - interval '30 minutes');
  INSERT INTO public.notifications (user_id, type, title, body, related_entity_type, related_entity_id, read, created_at)
  VALUES
    (user_b, 'walk_requested', 'Walk Request', 'Иван wants to walk your dog Rocky.', 'walk', walk_6, false, now() - interval '2 hours'),
    (user_b, 'walk_completed', 'Walk Completed', 'Иван completed a walk with Rocky.', 'walk', walk_2, true, now() - interval '1 day'),
    (user_b, 'walk_started', 'Walk Started', 'Иван started walking Bella.', 'walk', walk_4, false, now() - interval '15 minutes'),
    (user_b, 'walk_approved', 'Walk Approved', 'Иван approved your request to walk Max.', 'walk', walk_5, true, now() - interval '4 hours'),
    (user_b, 'adoption_approved', 'Adoption Approved', 'Bailey has been adopted by Иван.', 'adoption_request', adopt_1, true, now() - interval '9 days');

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Dogs: Buddy(%), Luna(%), Max(%), Rocky(%), Bella(%), Bailey(%)',
    dog_buddy, dog_luna, dog_max, dog_rocky, dog_bella, dog_bailey;
END $$;
