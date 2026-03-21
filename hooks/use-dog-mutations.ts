import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { uploadImage, deleteImage, StorageBucket } from '@/lib/storage';
import { Dog, DogSize, DogStatus } from '@/types/database';

const DOG_PHOTOS_BUCKET: StorageBucket = 'dog-photos';

export interface DogFormData {
  name: string;
  breed: string;
  description: string;
  size: DogSize;
  age: string;
  status: DogStatus;
  latitude: number | null;
  longitude: number | null;
  photoBase64: string | null;
}

export function useDogMutations() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function addDog(form: DogFormData): Promise<Dog> {
    if (!user) throw new Error('Not authenticated');
    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;
      if (form.photoBase64) {
        photoUrl = await uploadImage(DOG_PHOTOS_BUCKET, form.photoBase64, 'dog.jpg');
      }

      const { data, error } = await supabase
        .from('dogs')
        .insert({
          owner_id: user.id,
          name: form.name.trim(),
          breed: form.breed.trim(),
          description: form.description.trim() || null,
          size: form.size,
          age: form.age.trim() || null,
          status: form.status,
          latitude: form.latitude,
          longitude: form.longitude,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Dog;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateDog(dogId: string, form: DogFormData, existingPhotoUrl: string | null): Promise<Dog> {
    if (!user) throw new Error('Not authenticated');
    setIsSubmitting(true);

    try {
      let photoUrl = existingPhotoUrl;

      if (form.photoBase64) {
        // Upload new photo, then delete old one
        photoUrl = await uploadImage(DOG_PHOTOS_BUCKET, form.photoBase64, 'dog.jpg');
        await deleteImage(existingPhotoUrl);
      }

      const { data, error } = await supabase
        .from('dogs')
        .update({
          name: form.name.trim(),
          breed: form.breed.trim(),
          description: form.description.trim() || null,
          size: form.size,
          age: form.age.trim() || null,
          status: form.status,
          latitude: form.latitude,
          longitude: form.longitude,
          photo_url: photoUrl,
        })
        .eq('id', dogId)
        .select()
        .single();

      if (error) throw error;
      return data as Dog;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteDog(dogId: string, photoUrl: string | null): Promise<void> {
    if (!user) throw new Error('Not authenticated');
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', dogId);

      if (error) throw error;
      await deleteImage(photoUrl);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { addDog, updateDog, deleteDog, isSubmitting };
}
