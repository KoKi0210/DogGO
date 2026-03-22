# Database Setup Guide - Fix "App Stuck Loading"

## Problem

The app gets stuck on the loading screen because the **database tables haven't been created yet** in Supabase. The `AuthProvider` tries to query the `profiles` table, which doesn't exist, causing the app to hang.

## Solution

You need to run the database migration in your Supabase project. Follow these steps:

---

## Step 1: Run the SQL Migration

### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/exhtoqclqlmpnxqzawwe

2. Click **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`

5. Paste it into the SQL editor

6. Click **Run** (or press Cmd/Ctrl + Enter)

7. You should see "Success. No rows returned" if everything worked

### Option B: Supabase CLI (if you have it installed)

```bash
supabase db push
```

---

## Step 2: Create Storage Buckets

After running the migration, create the storage buckets:

### Via Supabase Dashboard:

1. Go to **Storage** in the left sidebar

2. Click **New bucket**

3. Create these 3 buckets (all **public**):
   - `avatars`
   - `dog-photos`
   - `walk-selfies`

4. For each bucket, make it **public** by toggling the "Public bucket" option

### Via SQL (Alternative):

Run this in the SQL Editor:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('dog-photos', 'dog-photos', true),
  ('walk-selfies', 'walk-selfies', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'dog-photos', 'walk-selfies'));

CREATE POLICY "Auth upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('avatars', 'dog-photos', 'walk-selfies'));

CREATE POLICY "Owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Step 3: Restart the App

Once the migration is complete:

1. **Stop** the current Expo dev server (Ctrl+C)

2. **Clear cache** and restart:
   ```bash
   npx expo start --clear
   ```

3. The app should now load properly! 🎉

---

## Verification

When you start the app, check the terminal console. You should see:

```
✅ Database is set up correctly
✅ All storage buckets exist
```

If you see error messages instead, they will tell you exactly what's missing.

---

## What Was Changed

To fix the loading issue, I added:

1. **Better error handling** in `contexts/auth-context.tsx`:
   - Now catches errors when profiles table doesn't exist
   - Sets `isLoading = false` even if the query fails
   - Shows helpful console warnings

2. **Database check utility** in `lib/db-check.ts`:
   - Checks if tables exist on app startup
   - Shows clear error messages in console
   - Helps diagnose setup issues

---

## Common Issues

### "relation "public.profiles" does not exist"
→ You haven't run the SQL migration yet. Go to Step 1.

### "The table does not exist or you do not have permission"
→ Check that RLS policies were created. Re-run the full migration.

### "Storage bucket not found"
→ You haven't created the storage buckets. Go to Step 2.

### App still stuck after migration
→ Clear cache and restart:
```bash
npx expo start --clear
```

---

## Quick Test After Setup

Once everything is set up:

1. **Register a new account** → Should create profile automatically
2. **Go to Profile tab** → Should see your display name
3. **Tap "Add Dog"** → Should open form
4. **Pick a photo** → Should work (camera permission required)
5. **Save dog** → Should upload to Supabase Storage

---

## Next Steps

After the database is set up and the app loads:

1. **Test Phase 1** (Auth):
   - Register/login
   - Check profile
   - Change language in settings

2. **Test Phase 2** (Dogs):
   - Add a dog with photo and location
   - View it in "My Dogs"
   - See it in the Home feed (from another account)

3. **Move to Phase 3** (Walks):
   - Implement walk requests
   - GPS tracking
   - Route mapping

---

## Need Help?

If you're still having issues after following these steps:

1. Check the **Supabase Dashboard Logs** (Database > Logs)
2. Check the **Expo dev console** for errors
3. Verify your `.env` file has the correct Supabase credentials
4. Make sure you're using the correct Supabase project URL

---

**The app should work after running the migration!** 🚀
