import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useWalkMutations } from '@/hooks/use-walk-mutations';
import { useAdoptionMutations } from '@/hooks/use-adoption-mutations';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Dog, Profile } from '@/types/database';

export default function DogDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { requestWalk, startOwnDogWalk, isSubmitting } = useWalkMutations();
  const { requestAdoption, isSubmitting: isAdoptionSubmitting } = useAdoptionMutations();

  const [dog, setDog] = useState<Dog | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');
  const surfaceAccent = useThemeColor({}, 'surfaceAccent');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dogs')
          .select('*, owner:profiles(*)')
          .eq('id', id)
          .single();

        if (cancelled) return;
        if (error) throw error;

        const { owner: ownerData, ...dogData } = data as Dog & { owner: Profile | null };
        setDog(dogData);
        setOwner(ownerData);
      } catch (err) {
        console.error('Error fetching dog:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const isOwner = user?.id === dog?.owner_id;

  async function handleRequestWalk() {
    if (!id) return;
    try {
      const walk = await requestWalk(id);
      Alert.alert(t('walks.walkRequested'), t('walks.walkRequestedMessage'));
      router.push(`/walk/${walk.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  async function handleStartMyDogWalk() {
    if (!id) return;
    try {
      const walk = await startOwnDogWalk(id);
      Alert.alert(t('walks.walkStarted'), t('walks.walkStartedMessage'));
      router.push(`/walk/${walk.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'NOT_DOG_OWNER') {
        Alert.alert(t('common.error'), t('walks.onlyOwnerCanStartOwnDogWalk'));
      } else {
        Alert.alert(t('common.error'), message);
      }
    }
  }

  async function handleRequestAdoption() {
    if (!id) return;
    try {
      const request = await requestAdoption(id);
      Alert.alert(t('adoption.requestSent'), t('adoption.requestSentMessage'));
      router.push(`/adoption/${request.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'ALREADY_REQUESTED') {
        Alert.alert(t('adoption.alreadyRequested'), t('adoption.alreadyRequestedMessage'));
      } else {
        Alert.alert(t('common.error'), message);
      }
    }
  }

  if (isLoading) return <Loading fullScreen />;

  if (!dog) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={{ color: text }}>{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: dog.name }} />
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
        {dog.photo_url ? (
          <Image source={{ uri: dog.photo_url }} style={styles.heroPhoto} />
        ) : (
          <View style={[styles.heroPhoto, styles.heroPlaceholder, { backgroundColor: primary + '20' }]}>
            <IconSymbol name="pawprint.fill" size={40} color={primary} />
          </View>
        )}

        <View style={styles.content}>
          <Text style={[styles.name, { color: text }]}>{dog.name}</Text>

          <View style={styles.infoGrid}>
            <InfoItem label={t('dogs.breed')} value={dog.breed} textColor={text} labelColor={textSecondary} bgColor={surfaceSecondary} />
            <InfoItem label={t('dogs.age')} value={dog.age ?? '—'} textColor={text} labelColor={textSecondary} bgColor={surfaceAccent} />
            <InfoItem label={t('dogs.size')} value={t(`dogs.${dog.size}`)} textColor={text} labelColor={textSecondary} bgColor={surfacePrimary} />
          </View>

          {dog.description ? (
            <Text style={[styles.description, { color: text }]}>{dog.description}</Text>
          ) : null}

          {owner && (
            <Card style={styles.ownerCard}>
              <Text style={[styles.ownerLabel, { color: textSecondary }]}>{t('dogs.owner')}</Text>
              <View style={styles.ownerRow}>
                <Avatar uri={owner.avatar_url} name={owner.display_name} size={40} />
                <View style={styles.ownerInfo}>
                  <Text style={[styles.ownerName, { color: text }]}>{owner.display_name}</Text>
                  <Text style={[styles.ownerRole, { color: textSecondary }]}>{owner.role}</Text>
                </View>
              </View>
            </Card>
          )}

          {dog.latitude != null && dog.longitude != null && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: dog.latitude,
                longitude: dog.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: dog.latitude, longitude: dog.longitude }} />
            </MapView>
          )}

          <View style={styles.actions}>
            {!isOwner && (dog.status === 'walk' || dog.status === 'both') && (
              <Button
                title={t('walks.requestWalk')}
                onPress={handleRequestWalk}
                loading={isSubmitting}
              />
            )}
            {!isOwner && (dog.status === 'adoption' || dog.status === 'both') && (
              <Button
                title={t('adoption.requestAdoption')}
                onPress={handleRequestAdoption}
                variant="secondary"
                loading={isAdoptionSubmitting}
              />
            )}
            {isOwner && (
              <>
                <Button
                  title={t('walks.startMyDogWalk')}
                  onPress={handleStartMyDogWalk}
                  loading={isSubmitting}
                />
                <Button
                  title={t('common.edit')}
                  onPress={() => router.push(`/dog/add?dogId=${id}`)}
                  variant="secondary"
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function InfoItem({ label, value, textColor, labelColor, bgColor }: {
  label: string; value: string; textColor: string; labelColor: string; bgColor?: string;
}) {
  return (
    <View style={[infoStyles.item, bgColor ? { backgroundColor: bgColor } : undefined]}>
      <Text style={[infoStyles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  item: { flex: 1, padding: 12, borderRadius: 16 },
  label: { fontSize: 12, marginBottom: 2, fontWeight: '600' },
  value: { fontSize: 16, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroPhoto: { width: '100%', height: 300 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24 },
  name: { fontSize: 32, fontWeight: '900', marginBottom: 16, letterSpacing: -0.5 },
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  ownerCard: { marginBottom: 16 },
  ownerLabel: { fontSize: 12, marginBottom: 8, fontWeight: '600' },
  ownerRow: { flexDirection: 'row', alignItems: 'center' },
  ownerInfo: { marginLeft: 12 },
  ownerName: { fontSize: 16, fontWeight: '600' },
  ownerRole: { fontSize: 13, textTransform: 'capitalize' },
  map: { height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  actions: { gap: 12 },
});
