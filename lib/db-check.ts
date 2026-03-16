import { supabase } from './supabase';

/**
 * Check if the database is properly set up.
 * Returns true if profiles table exists and is accessible.
 */
export async function checkDatabaseSetup(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.error('Database tables not created yet!');
        console.error('Please run the SQL migration in Supabase Dashboard:');
        console.error('  supabase/migrations/001_initial_schema.sql');
        return false;
      }
      console.warn('Database query error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected database error:', err);
    return false;
  }
}

/**
 * Check if storage buckets exist.
 */
export async function checkStorageBuckets(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.warn('Could not check storage buckets:', error.message);
      return false;
    }

    const requiredBuckets = ['avatars', 'dog-photos', 'walk-selfies'];
    const existingBuckets = data.map((b) => b.name);
    const missingBuckets = requiredBuckets.filter((b) => !existingBuckets.includes(b));

    if (missingBuckets.length > 0) {
      console.warn('Missing storage buckets:', missingBuckets.join(', '));
      console.warn('Create them in Supabase Dashboard > Storage');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected storage error:', err);
    return false;
  }
}
