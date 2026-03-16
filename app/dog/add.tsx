import { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDog } from '@/hooks/use-dog';
import { useDogMutations, DogFormData } from '@/hooks/use-dog-mutations';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { PhotoPicker } from '@/components/photo-picker';
import { LocationPicker } from '@/components/location-picker';
import { Loading } from '@/components/loading';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DogStatus, DogSize } from '@/types/database';

const STATUS_OPTIONS: DogStatus[] = ['walk', 'adoption', 'both'];
const SIZE_OPTIONS: DogSize[] = ['small', 'medium', 'large'];

export default function AddDogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { dogId } = useLocalSearchParams<{ dogId?: string }>();
  const isEdit = !!dogId;

  const { dog, isLoading: isDogLoading } = useDog(dogId ?? '');
  const { addDog, updateDog, isSubmitting } = useDogMutations();

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<DogStatus | null>(null);
  const [size, setSize] = useState<DogSize | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && dog) {
      setName(dog.name);
      setBreed(dog.breed);
      setAge(dog.age ?? '');
      setDescription(dog.description ?? '');
      setStatus(dog.status);
      setSize(dog.size);
      setPhotoUri(dog.photo_url);
      setLatitude(dog.latitude);
      setLongitude(dog.longitude);
    }
  }, [isEdit, dog]);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('dogs.nameRequired');
    if (!breed.trim()) newErrors.breed = t('dogs.breedRequired');
    if (!photoUri) newErrors.photo = t('dogs.photoRequired');
    if (!status) newErrors.status = t('dogs.statusRequired');
    if (!size) newErrors.size = t('dogs.sizeRequired');
    if (!age.trim()) newErrors.age = t('dogs.ageRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const formData: DogFormData = {
      name: name.trim(),
      breed: breed.trim(),
      age: age.trim(),
      description: description.trim(),
      status: status!,
      size: size!,
      photoUri,
      photoBase64,
      latitude,
      longitude,
    };

    try {
      if (isEdit && dogId) {
        await updateDog(dogId, formData, dog?.photo_url ?? null);
        Alert.alert(t('common.success'), t('dogs.dogUpdated'));
      } else {
        await addDog(formData);
        Alert.alert(t('common.success'), t('dogs.dogAdded'));
      }
      router.back();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  if (isEdit && isDogLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? t('dogs.editDog') : t('dogs.addDog') }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: background }]}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <PhotoPicker uri={photoUri} onPick={(uri, base64) => { setPhotoUri(uri); setPhotoBase64(base64); }} error={errors.photo} />

          <Input
            label={t('dogs.name')}
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label={t('dogs.breed')}
            value={breed}
            onChangeText={setBreed}
            error={errors.breed}
          />
          <Input
            label={t('dogs.age')}
            value={age}
            onChangeText={setAge}
            error={errors.age}
            placeholder="e.g. 2 years"
          />

          <View style={styles.chipSection}>
            <Text style={[styles.chipLabel, { color: textSecondary }]}>{t('dogs.status')}</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setStatus(option)}
                  style={[
                    styles.chip,
                    { borderColor: status === option ? primary : border },
                  ]}>
                  <Text style={[styles.chipText, { color: status === option ? primary : text }]}>
                    {t(`dogs.status${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.status && (
              <Text style={[styles.chipError, { color: errorColor }]}>
                {errors.status}
              </Text>
            )}
          </View>

          <View style={styles.chipSection}>
            <Text style={[styles.chipLabel, { color: textSecondary }]}>{t('dogs.size')}</Text>
            <View style={styles.chipRow}>
              {SIZE_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setSize(option)}
                  style={[
                    styles.chip,
                    { borderColor: size === option ? primary : border },
                  ]}>
                  <Text style={[styles.chipText, { color: size === option ? primary : text }]}>
                    {t(`dogs.${option}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.size && (
              <Text style={[styles.chipError, { color: errorColor }]}>
                {errors.size}
              </Text>
            )}
          </View>

          <Input
            label={t('dogs.description')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lon) => {
              setLatitude(lat);
              setLongitude(lon);
            }}
          />

          <Button
            title={isEdit ? t('common.save') : t('dogs.addDog')}
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  chipSection: {
    marginBottom: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipError: {
    fontSize: 12,
    marginTop: 4,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});
