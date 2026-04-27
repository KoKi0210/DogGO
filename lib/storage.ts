import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

export type StorageBucket = 'avatars' | 'dog-photos' | 'walk-selfies';

function parseStorageObject(url: string): { bucket: string; path: string } | null {
  const PUBLIC_SEGMENT = '/storage/v1/object/public/';
  const SIGNED_SEGMENT = '/storage/v1/object/sign/';
  const AUTH_SEGMENT = '/storage/v1/object/authenticated/';

  const segment = [PUBLIC_SEGMENT, SIGNED_SEGMENT, AUTH_SEGMENT].find((part) => url.includes(part));
  if (!segment) return null;

  const [, objectPart] = url.split(segment);
  if (!objectPart) return null;

  const pathWithoutQuery = objectPart.split('?')[0];
  const [bucket, ...pathParts] = pathWithoutQuery.split('/');
  if (!bucket || pathParts.length === 0) return null;

  return {
    bucket,
    path: decodeURIComponent(pathParts.join('/')),
  };
}

/**
 * Resolve an image URL to a loadable URL for the current user.
 * For Supabase storage URLs, it attempts a signed URL and falls back to the original URL.
 */
export async function resolveImageUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  // Local device URIs should be used as-is.
  if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return trimmed;
  }

  const parsed = parseStorageObject(trimmed);
  if (!parsed) return trimmed;

  try {
    const { data, error } = await supabase.storage
      .from(parsed.bucket)
      .createSignedUrl(parsed.path, 60 * 60);

    if (error || !data?.signedUrl) {
      return trimmed;
    }

    return data.signedUrl;
  } catch {
    return trimmed;
  }
}

/**
 * Upload an image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(
  bucket: StorageBucket,
  base64: string,
  fileName: string
): Promise<string> {
  try {
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const extension = (fileName.split('.').pop() || 'jpg').toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error('Invalid image format. Only JPG, PNG, WebP and GIF are allowed.');
    }

    const MIME_MAP: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, decode(base64), {
        contentType: MIME_MAP[extension],
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload image: ${message}`);
  }
}

/**
 * Delete an image from Supabase Storage.
 */
export async function deleteImage(photoUrl: string | null): Promise<void> {
  if (!photoUrl) return;

  try {
    const urlParts = photoUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return;

    const [bucket, ...pathParts] = urlParts[1].split('/');
    const path = pathParts.join('/');

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.warn('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
