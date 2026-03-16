import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { DogStatus, DogSize } from '@/types/database';
import { uploadImage, deleteImage } from '@/lib/storage';
import { IMAGE_PICKER } from '@/constants/layout';

export interface DogFormData {
  name: string;
  breed: string;
  age: string;
  description: string;
  status: DogStatus;
  size: DogSize;
  photoUri: string | null;
  photoBase64: string | null;
  latitude: number | null;
  longitude: number | null;
}

async function uploadDogPhoto(
  base64: string | null,
  existingUrl: string | null
): Promise<string | null> {
  if (!base64) return existingUrl;

  if (existingUrl) {
    await deleteImage(existingUrl);
  }

  return uploadImage('dog-photos', base64, IMAGE_PICKER.DEFAULT_FILENAME);
}

export function useDogMutations() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function addDog(formData: DogFormData) {
    if (!user) throw new Error('User not authenticated');

    setIsSubmitting(true);

    try {
      const photoUrl = await uploadDogPhoto(formData.photoBase64, null);

      const { error } = await supabase.from('dogs').insert({
        owner_id: user.id,
        name: formData.name,
        breed: formData.breed,
        age: formData.age,
        description: formData.description,
        status: formData.status,
        size: formData.size,
        photo_url: photoUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error adding dog:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateDog(
    dogId: string,
    formData: DogFormData,
    currentPhotoUrl: string | null
  ) {
    if (!user) throw new Error('User not authenticated');

    setIsSubmitting(true);

    try {
      const photoUrl = await uploadDogPhoto(formData.photoBase64, currentPhotoUrl);

      const { error } = await supabase
        .from('dogs')
        .update({
          name: formData.name,
          breed: formData.breed,
          age: formData.age,
          description: formData.description,
          status: formData.status,
          size: formData.size,
          photo_url: photoUrl,
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        .eq('id', dogId);

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error updating dog:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteDog(dogId: string, photoUrl: string | null | undefined) {
    if (!user) throw new Error('User not authenticated');

    setIsSubmitting(true);

    try {
      if (photoUrl) {
        await deleteImage(photoUrl);
      }

      const { error } = await supabase.from('dogs').delete().eq('id', dogId);

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error deleting dog:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { addDog, updateDog, deleteDog, isSubmitting };
}
