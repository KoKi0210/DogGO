import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useWalk } from '@/hooks/use-walk';
import { useWalkMutations } from '@/hooks/use-walk-mutations';
import { useWalkTracking } from '@/hooks/use-walk-tracking';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { WalkMap } from '@/components/walk-map';
import { WalkStats } from '@/components/walk-stats';
import { Avatar } from '@/components/avatar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { uploadImage } from '@/lib/storage';

export default function WalkDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { walk, isLoading, error, refresh } = useWalk(id);
  const { approveWalk, rejectWalk, startWalk, endWalk, cancelWalk, deleteWalk, isSubmitting } = useWalkMutations();
  const tracking = useWalkTracking();

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const errorColor = useThemeColor({}, 'error');

  const isWalker = user?.id === walk?.walker_id;
  const isOwner = user?.id === walk?.owner?.id;
  const bootstrappedWalkIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (walk?.status === 'completed' && id) {
      router.replace(`/walk/summary?walkId=${id}`);
    }
  }, [walk?.status, id, router]);

  useEffect(() => {
    const canBootstrap =
      !!id &&
      walk?.status === 'active' &&
      isWalker &&
      !tracking.isTracking &&
      bootstrappedWalkIdRef.current !== id;

    if (!canBootstrap) return;

    bootstrappedWalkIdRef.current = id;
    const startedAtSeed = walk?.started_at ? new Date(walk.started_at) : undefined;

    tracking.startTracking(startedAtSeed).catch((err: unknown) => {
      bootstrappedWalkIdRef.current = null;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(t('common.error'), msg);
    });
  }, [id, walk?.status, walk?.started_at, isWalker, tracking, t]);

  const handleStart = useCallback(async () => {
    if (!id) return;
    try {
      await startWalk(id);
      await tracking.startTracking();
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(t('common.error'), msg);
    }
  }, [id, startWalk, tracking, refresh, t]);

  const handleEnd = useCallback(async () => {
    if (!id || !walk) return;

    Alert.alert(t('walks.endWalk'), t('walks.confirmEnd'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('walks.endWalk'),
        onPress: async () => {
          const result = tracking.stopTracking();

          let selfieUrl: string | null = null;
          let selfiePreviewUri: string | null = null;
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status === 'granted') {
              const photo = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
              });
              if (!photo.canceled && photo.assets[0]) {
                selfiePreviewUri = photo.assets[0].uri;
                if (photo.assets[0].base64) {
                  try {
                    selfieUrl = await uploadImage('walk-selfies', photo.assets[0].base64, 'selfie.jpg');
                  } catch (uploadErr) {
                    console.error('Selfie upload failed, using local preview only:', uploadErr);
                  }
                }
              }
            }
          } catch {
          }

          try {
            const isAdoptedDog = walk.dog?.status === 'adopted' && walk.dog?.owner_id === user?.id;
            const fallbackDurationMins = walk.started_at
              ? Math.max(1, Math.round((Date.now() - new Date(walk.started_at).getTime()) / 60000))
              : 0;
            await endWalk(id, {
              route: result.route,
              distanceKm: result.distanceKm,
              durationMins: result.durationMins > 0 ? result.durationMins : fallbackDurationMins,
              isAdoptedDog: isAdoptedDog ?? false,
              selfieUrl,
            });

            const params = [`walkId=${encodeURIComponent(id)}`];
            if (selfieUrl) {
              params.push(`selfieUploadedUri=${encodeURIComponent(selfieUrl)}`);
            }
            if (selfiePreviewUri) {
              params.push(`selfieLocalUri=${encodeURIComponent(selfiePreviewUri)}`);
            }
            router.replace(`/walk/summary?${params.join('&')}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            Alert.alert(t('common.error'), msg);
          }
        },
      },
    ]);
  }, [id, walk, tracking, endWalk, user, router, t]);

  const handleApprove = useCallback(async () => {
    if (!id) return;
    try {
      await approveWalk(id);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(t('common.error'), msg);
    }
  }, [id, approveWalk, refresh, t]);

  const handleReject = useCallback(async () => {
    if (!id) return;
    try {
      await rejectWalk(id);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(t('common.error'), msg);
    }
  }, [id, rejectWalk, refresh, t]);

  const handleCancel = useCallback(async () => {
    if (!id) return;
    Alert.alert(t('walks.cancelWalk'), t('walks.confirmCancel'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('walks.cancelWalk'),
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelWalk(id);
            router.back();
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            Alert.alert(t('common.error'), msg);
          }
        },
      },
    ]);
  }, [id, cancelWalk, router, t]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    Alert.alert(t('walks.deleteWalk'), t('walks.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWalk(id);
            router.back();
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            Alert.alert(t('common.error'), msg);
          }
        },
      },
    ]);
  }, [id, deleteWalk, router, t]);

  if (isLoading) return <Loading fullScreen />;

  if (error || !walk) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={{ color: text }}>{error ?? t('common.error')}</Text>
      </View>
    );
  }

  const dog = walk.dog;
  const title = dog ? t('walks.walkWith', { dogName: dog.name }) : t('walks.activeWalk');

  if (walk.status === 'active' || tracking.isTracking) {
    return (
      <>
        <Stack.Screen options={{ title, headerBackVisible: false }} />
        <View style={[styles.container, { backgroundColor: background }]}>
          <WalkMap
            route={tracking.route}
            followUser
            height={300}
          />

          <View style={styles.content}>
            <Text style={styles.trackingLabel}>
              {t('walks.trackingActive')}
            </Text>

            <WalkStats
              distanceKm={tracking.distanceKm}
              durationMins={tracking.durationMins}
              durationSeconds={tracking.durationSeconds}
              liveFormat
              avgSpeed={tracking.currentSpeed}
            />

            <View style={styles.actions}>
              <Button
                title={t('walks.endWalk')}
                onPress={handleEnd}
                loading={isSubmitting}
                variant="danger"
              />
            </View>
          </View>
        </View>
      </>
    );
  }

  if (walk.status === 'completed') {
    return <Loading fullScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
        {dog?.photo_url && (
          <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} />
        )}

        <View style={styles.content}>
          {dog && (
            <View style={styles.dogInfo}>
              <Text style={[styles.dogName, { color: text }]}>{dog.name}</Text>
              <Text style={[styles.dogBreed, { color: textSecondary }]}>{dog.breed}</Text>
            </View>
          )}

          {walk.walker && (
            <Card style={styles.personCard}>
              <Text style={[styles.personLabel, { color: textSecondary }]}>Walker</Text>
              <View style={styles.personRow}>
                <Avatar uri={walk.walker.avatar_url} name={walk.walker.display_name} size={36} />
                <Text style={[styles.personName, { color: text }]}>{walk.walker.display_name}</Text>
              </View>
            </Card>
          )}

          {walk.owner && (
            <Card style={styles.personCard}>
              <Text style={[styles.personLabel, { color: textSecondary }]}>{t('dogs.owner')}</Text>
              <View style={styles.personRow}>
                <Avatar uri={walk.owner.avatar_url} name={walk.owner.display_name} size={36} />
                <Text style={[styles.personName, { color: text }]}>{walk.owner.display_name}</Text>
              </View>
            </Card>
          )}

          {walk.status === 'requested' && isWalker && (
            <Card style={styles.statusCard}>
              <Text style={[styles.statusText, { color: textSecondary }]}>
                {t('walks.waitingApproval')}
              </Text>
              <Button
                title={t('walks.cancelWalk')}
                onPress={handleCancel}
                variant="outline"
                style={{ borderColor: errorColor, marginTop: 12 }}
              />
            </Card>
          )}

          {walk.status === 'requested' && isOwner && (
            <View style={styles.actions}>
              <Button
                title={t('walks.approveWalk')}
                onPress={handleApprove}
                loading={isSubmitting}
              />
              <Button
                title={t('walks.rejectWalk')}
                onPress={handleReject}
                variant="outline"
                style={{ borderColor: errorColor }}
              />
            </View>
          )}

          {walk.status === 'approved' && isWalker && (
            <Card style={styles.statusCard}>
              <Text style={[styles.statusText, { color: accent }]}>
                {t('walks.readyToStart')}
              </Text>
              <Button
                title={t('walks.startWalk')}
                onPress={handleStart}
                loading={isSubmitting}
                style={{ marginTop: 12 }}
              />
            </Card>
          )}

          {walk.status === 'cancelled' && (
            <Card style={styles.statusCard}>
              <Text style={[styles.statusText, { color: errorColor }]}>
                {t('walks.walkCancelled')}
              </Text>
            </Card>
          )}

          {(isWalker || isOwner) && (
            <Button
              title={t('walks.deleteWalk')}
              onPress={handleDelete}
              loading={isSubmitting}
              variant="danger"
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 16 },
  dogPhoto: { width: '100%', height: 200 },
  dogInfo: { marginBottom: 4 },
  dogName: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  dogBreed: { fontSize: 14, marginTop: 2 },
  personCard: { marginBottom: 0 },
  personLabel: { fontSize: 12, marginBottom: 6, fontWeight: '600' },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personName: { fontSize: 15, fontWeight: '600' },
  statusCard: { alignItems: 'center', paddingVertical: 24 },
  statusText: { fontSize: 15, textAlign: 'center', fontWeight: '600' },
  trackingLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#2EC4B6',
    color: '#FFFFFF',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actions: { gap: 12, marginTop: 8 },
});
