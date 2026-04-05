import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import { useDogMutations, DogFormData } from '@/hooks/use-dog-mutations';
import { getCurrentLocation } from '@/lib/location';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Dog, DogSize, DogStatus, EnergyLevel } from '@/types/database';

const SIZES: DogSize[] = ['small', 'medium', 'large'];
const STATUSES: DogStatus[] = ['walk', 'adoption', 'both'];
const ENERGY_LEVELS: EnergyLevel[] = ['low', 'medium', 'high'];

const DEFAULT_REGION = {
  latitude: 42.6977,
  longitude: 23.3219,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function AddDogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { dogId } = useLocalSearchParams<{ dogId?: string }>();
  const { addDog, updateDog, deleteDog, isSubmitting } = useDogMutations();

  const isEditing = !!dogId;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const errorColor = useThemeColor({}, 'error');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');

  // Form state
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<DogSize>('medium');
  const [status, setStatus] = useState<DogStatus>('walk');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingDog, setIsLoadingDog] = useState(isEditing);

  // Load existing dog data for editing
  useEffect(() => {
    if (!dogId) return;
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('dogs')
          .select('*')
          .eq('id', dogId)
          .single();

        if (cancelled) return;
        if (error) throw error;

        const dog = data as Dog;
        setName(dog.name);
        setBreed(dog.breed);
        setAge(dog.age ?? '');
        setDescription(dog.description ?? '');
        setSize(dog.size);
        setStatus(dog.status);
        setEnergyLevel(dog.energy_level);
        setLatitude(dog.latitude);
        setLongitude(dog.longitude);
        setExistingPhotoUrl(dog.photo_url);
        if (dog.photo_url) setPhotoUri(dog.photo_url);
      } catch (err) {
        console.error('Error loading dog:', err);
        Alert.alert(t('common.error'));
        router.back();
      } finally {
        if (!cancelled) setIsLoadingDog(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dogId, t, router]);

  // Set initial map location from GPS
  useEffect(() => {
    if (latitude != null) return; // Already set (editing)
    getCurrentLocation().then((loc) => {
      if (loc && latitude == null) {
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('dogs.nameRequired');
    if (!breed.trim()) newErrors.breed = t('dogs.breedRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePickImage(source: 'camera' | 'library') {
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(t('common.error'), 'Permission required');
        return;
      }

      const launch = source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

      const result = await launch({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoBase64(result.assets[0].base64 ?? null);
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  }

  function handleRemovePhoto() {
    setPhotoBase64(null);
    setPhotoUri(null);
    setExistingPhotoUrl(null);
  }

  function handleMapPress(event: MapPressEvent) {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
  }

  async function handleSubmit() {
    if (!validate()) return;

    const formData: DogFormData = {
      name,
      breed,
      description,
      size,
      age,
      status,
      energyLevel,
      latitude,
      longitude,
      photoBase64,
    };

    try {
      if (isEditing) {
        await updateDog(dogId, formData, existingPhotoUrl);
        Alert.alert(t('common.success'), t('dogs.updateSuccess'));
      } else {
        await addDog(formData);
        Alert.alert(t('common.success'), t('dogs.addSuccess'));
      }
      router.back();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  async function handleDelete() {
    if (!dogId) return;
    Alert.alert(t('common.delete'), t('dogs.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDog(dogId, existingPhotoUrl);
            Alert.alert(t('common.success'), t('dogs.deleteSuccess'));
            router.back();
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(t('common.error'), message);
          }
        },
      },
    ]);
  }

  if (isLoadingDog) return <Loading fullScreen />;

  const mapRegion = latitude != null && longitude != null
    ? { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? t('common.edit') : t('dogs.addDog') }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: background }]}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Section */}
          <Card style={styles.photoSection}>
            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <Pressable
                  style={[styles.removePhotoBtn, { backgroundColor: errorColor }]}
                  onPress={handleRemovePhoto}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: surfacePrimary }]}>
                <Text style={styles.photoEmoji}>📷</Text>
                <Text style={[styles.photoHint, { color: textSecondary }]}>
                  {t('dogs.photoHint')}
                </Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <Button
                title={t('dogs.choosePhoto')}
                onPress={() => handlePickImage('library')}
                variant="outline"
                style={styles.photoButton}
              />
              <Button
                title={t('dogs.takePhoto')}
                onPress={() => handlePickImage('camera')}
                variant="outline"
                style={styles.photoButton}
              />
            </View>
          </Card>

          {/* Basic Info */}
          <Input
            label={t('dogs.name')}
            value={name}
            onChangeText={setName}
            error={errors.name}
            placeholder="Buddy"
          />
          <Input
            label={t('dogs.breed')}
            value={breed}
            onChangeText={setBreed}
            error={errors.breed}
            placeholder="Golden Retriever"
          />
          <Input
            label={t('dogs.age')}
            value={age}
            onChangeText={setAge}
            placeholder={`2 ${t('dogs.years')}`}
          />
          <Input
            label={t('dogs.description')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('dogs.description')}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          {/* Size Picker */}
          <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.size')}</Text>
          <View style={styles.chipRow}>
            {SIZES.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.chip,
                  { borderColor: size === s ? primary : border, backgroundColor: size === s ? primary : card },
                ]}
                onPress={() => setSize(s)}
              >
                <Text style={[styles.chipText, { color: size === s ? '#FFFFFF' : text }]}>
                  {t(`dogs.${s}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Status Picker */}
          <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.status')}</Text>
          <View style={styles.chipRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.chip,
                  { borderColor: status === s ? primary : border, backgroundColor: status === s ? primary : card },
                ]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, { color: status === s ? '#FFFFFF' : text }]}>
                  {t(`dogs.status${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Energy Level Picker */}
          <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.energyLevel')}</Text>
          <View style={styles.chipRow}>
            {ENERGY_LEVELS.map((e) => (
              <Pressable
                key={e}
                style={[
                  styles.chip,
                  { borderColor: energyLevel === e ? primary : border, backgroundColor: energyLevel === e ? primary : card },
                ]}
                onPress={() => setEnergyLevel(energyLevel === e ? null : e)}
              >
                <Text style={[styles.chipText, { color: energyLevel === e ? '#FFFFFF' : text }]}>
                  {t(`filters.${e}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Location Map */}
          <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.location')}</Text>
          <Text style={[styles.hint, { color: textSecondary }]}>{t('dogs.locationHint')}</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
              onPress={handleMapPress}
            >
              {latitude != null && longitude != null && (
                <Marker coordinate={{ latitude, longitude }} />
              )}
            </MapView>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={isEditing ? t('common.save') : t('dogs.addDog')}
              onPress={handleSubmit}
              loading={isSubmitting}
            />
            {isEditing && (
              <Button
                title={t('common.delete')}
                onPress={handleDelete}
                variant="outline"
                style={{ borderColor: errorColor }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  photoSection: { marginBottom: 16, alignItems: 'center' },
  photoPreviewContainer: { position: 'relative', marginBottom: 12 },
  photoPreview: { width: '100%', height: 200, borderRadius: 20 },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  photoPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoEmoji: { fontSize: 48, marginBottom: 8 },
  photoHint: { fontSize: 14 },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoButton: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  hint: { fontSize: 12, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  mapContainer: { height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  map: { flex: 1 },
  actions: { gap: 12, marginTop: 8 },
});
