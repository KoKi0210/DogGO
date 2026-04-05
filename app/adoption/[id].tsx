import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useAdoptionMutations } from '@/hooks/use-adoption-mutations';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AdoptionRequest, Dog, Profile, AdoptionStatus } from '@/types/database';

interface AdoptionWithDetails extends AdoptionRequest {
  dog: Dog | null;
  adopter: Profile | null;
}

const STATUS_COLORS: Record<AdoptionStatus, string> = {
  pending: '#FF9800',
  approved: '#4CAF50',
  rejected: '#F44336',
};

export default function AdoptionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { approveAdoption, rejectAdoption, isSubmitting } = useAdoptionMutations();

  const [request, setRequest] = useState<AdoptionWithDetails | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const placeholder = useThemeColor({}, 'placeholder');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('adoption_requests')
          .select('*, dog:dogs(*, owner:profiles(*)), adopter:profiles(*)')
          .eq('id', id)
          .single();

        if (cancelled) return;
        if (error) throw error;

        const raw = data as AdoptionRequest & {
          dog: (Dog & { owner: Profile | null }) | null;
          adopter: Profile | null;
        };

        setRequest({
          ...raw,
          dog: raw.dog ? { ...raw.dog, owner: undefined } as unknown as Dog : null,
          adopter: raw.adopter,
        });
        setOwner(raw.dog?.owner ?? null);
      } catch (err) {
        console.error('Error fetching adoption request:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const isOwner = user?.id === owner?.id;
  const isAdopter = user?.id === request?.adopter_id;

  async function handleApprove() {
    if (!id) return;
    try {
      await approveAdoption(id);
      Alert.alert(t('adoption.approved'), t('adoption.approvedMessage'));
      router.back();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  async function handleReject() {
    if (!id) return;
    Alert.alert(t('adoption.confirmReject'), t('adoption.confirmRejectMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.reject'),
        style: 'destructive',
        onPress: async () => {
          try {
            await rejectAdoption(id);
            router.back();
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(t('common.error'), message);
          }
        },
      },
    ]);
  }

  if (isLoading) return <Loading fullScreen />;

  if (!request) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={{ color: text }}>{t('common.error')}</Text>
      </View>
    );
  }

  const dog = request.dog;
  const adopter = request.adopter;
  const statusColor = STATUS_COLORS[request.status];

  return (
    <>
      <Stack.Screen options={{ title: t('adoption.adoptionRequest') }} />
      <ScrollView style={[styles.container, { backgroundColor: background }]} contentContainerStyle={styles.content}>
        {/* Status Badge */}
        <View style={[styles.statusCard, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {t(`adoption.status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`)}
            </Text>
          </View>
          <Text style={[styles.statusMessage, { color: text }]}>
            {request.status === 'pending' && (isOwner
              ? t('adoption.pendingOwnerMessage')
              : t('adoption.pendingAdopterMessage'))}
            {request.status === 'approved' && t('adoption.approvedMessage')}
            {request.status === 'rejected' && t('adoption.rejectedMessage')}
          </Text>
        </View>

        {/* Dog Info */}
        {dog && (
          <Card style={styles.dogCard}>
            <View style={styles.dogRow}>
              {dog.photo_url ? (
                <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} />
              ) : (
                <View style={[styles.dogPhoto, styles.dogPhotoPlaceholder, { backgroundColor: placeholder }]}>
                  <Text style={styles.dogEmoji}>🐕</Text>
                </View>
              )}
              <View style={styles.dogInfo}>
                <Text style={[styles.dogName, { color: text }]}>{dog.name}</Text>
                <Text style={[styles.dogBreed, { color: textSecondary }]}>{dog.breed}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Adopter Info (visible to owner) */}
        {isOwner && adopter && (
          <Card>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>{t('adoption.adopter')}</Text>
            <View style={styles.personRow}>
              <Avatar uri={adopter.avatar_url} name={adopter.display_name} size={44} />
              <View style={styles.personInfo}>
                <Text style={[styles.personName, { color: text }]}>{adopter.display_name}</Text>
                <Text style={[styles.personRole, { color: textSecondary }]}>{adopter.role}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Owner Info (visible to adopter) */}
        {isAdopter && owner && (
          <Card>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>{t('dogs.owner')}</Text>
            <View style={styles.personRow}>
              <Avatar uri={owner.avatar_url} name={owner.display_name} size={44} />
              <View style={styles.personInfo}>
                <Text style={[styles.personName, { color: text }]}>{owner.display_name}</Text>
                <Text style={[styles.personRole, { color: textSecondary }]}>{owner.role}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Actions for Owner on Pending */}
        {isOwner && request.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              title={t('common.approve')}
              onPress={handleApprove}
              loading={isSubmitting}
            />
            <Button
              title={t('common.reject')}
              onPress={handleReject}
              variant="secondary"
              loading={isSubmitting}
            />
          </View>
        )}

        {/* Success card for approved */}
        {request.status === 'approved' && (
          <Card style={{ ...styles.successCard, backgroundColor: accent + '15' }}>
            <Text style={[styles.successEmoji]}>🎉</Text>
            <Text style={[styles.successText, { color: accent }]}>{t('adoption.successMessage')}</Text>
          </Card>
        )}

        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="outline"
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusCard: { borderRadius: 12, padding: 16, alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  statusMessage: { fontSize: 14, textAlign: 'center' },
  dogCard: {},
  dogRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dogPhoto: { width: 64, height: 64, borderRadius: 12 },
  dogPhotoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dogEmoji: { fontSize: 28 },
  dogInfo: {},
  dogName: { fontSize: 18, fontWeight: '600' },
  dogBreed: { fontSize: 14, marginTop: 2 },
  sectionLabel: { fontSize: 12, marginBottom: 8 },
  personRow: { flexDirection: 'row', alignItems: 'center' },
  personInfo: { marginLeft: 12 },
  personName: { fontSize: 16, fontWeight: '500' },
  personRole: { fontSize: 13, textTransform: 'capitalize' },
  actions: { gap: 12 },
  successCard: { borderRadius: 12, padding: 24, alignItems: 'center', gap: 8 },
  successEmoji: { fontSize: 40 },
  successText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
