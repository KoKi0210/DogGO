import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

export type StorageBucket = 'avatars' | 'dog-photos' | 'walk-selfies';

/**
 * Upload an image to Supabase Storage
 * @param bucket - The storage bucket to upload to
 * @param base64 - Base64 encoded image data (without data:image/... prefix)
 * @param fileName - Desired file name (will be made unique)
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  bucket: StorageBucket,
  base64: string,
  fileName: string
): Promise<string> {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const extension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, decode(base64), {
        contentType: `image/${extension}`,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload image: ${message}`);
  }
}

/**
 * Delete an image from Supabase Storage
 * @param photoUrl - Full public URL of the image
 */
export async function deleteImage(photoUrl: string | null): Promise<void> {
  if (!photoUrl) return;

  try {
    // Extract bucket and path from URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = photoUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      console.warn('Invalid storage URL format:', photoUrl);
      return;
    }

    const [bucket, ...pathParts] = urlParts[1].split('/');
    const path = pathParts.join('/');

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.warn('Error deleting image:', error);
      // Don't throw - deletion is not critical
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - deletion is not critical
  }
}
