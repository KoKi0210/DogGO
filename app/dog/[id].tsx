import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useDog } from '@/hooks/use-dog';
import { useDogMutations } from '@/hooks/use-dog-mutations';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { useThemeColor } from '@/hooks/use-theme-color';
import { STATUS_KEY, getBadgeColorKey, getErrorMessage } from '@/lib/dog-utils';
import { MAP } from '@/constants/layout';

export default function DogDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dog, owner, isLoading, refresh } = useDog(id);
  const { deleteDog, isSubmitting } = useDogMutations();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  const badgeColorMap = {
    accent: useThemeColor({}, 'accent'),
    primary,
    secondary: useThemeColor({}, 'secondary'),
    textSecondary,
  };

  const isOwner = user?.id === dog?.owner_id;

  function handleEdit() {
    router.push(`/dog/add?dogId=${id}`);
  }

  function handleDelete() {
    Alert.alert(
      t('dogs.deleteConfirmTitle'),
      t('dogs.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDog(id, dog?.photo_url);
              Alert.alert(t('common.success'), t('dogs.dogDeleted'));
              router.back();
            } catch (error: unknown) {
              Alert.alert(t('common.error'), getErrorMessage(error));
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return <Loading fullScreen />;
  }

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
            <Text style={styles.heroEmoji}>🐕</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: text }]}>{dog.name}</Text>
            <View style={[styles.badge, { backgroundColor: badgeColorMap[getBadgeColorKey(dog.status)] }]}>
              <Text style={styles.badgeText}>{t(STATUS_KEY[dog.status])}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem label={t('dogs.breed')} value={dog.breed} textColor={text} labelColor={textSecondary} />
            <InfoItem label={t('dogs.age')} value={dog.age ?? '—'} textColor={text} labelColor={textSecondary} />
            <InfoItem label={t('dogs.size')} value={t(`dogs.${dog.size}`)} textColor={text} labelColor={textSecondary} />
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
                latitudeDelta: MAP.DETAIL_DELTA,
                longitudeDelta: MAP.DETAIL_DELTA,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: dog.latitude, longitude: dog.longitude }} />
            </MapView>
          )}

          <View style={styles.actions}>
            {isOwner ? (
              <>
                <Button title={t('common.edit')} onPress={handleEdit} />
                <Button
                  title={t('dogs.deleteDog')}
                  onPress={handleDelete}
                  variant="outline"
                  loading={isSubmitting}
                  style={{ borderColor: errorColor }}
                />
              </>
            ) : (
              <>
                <Button
                  title={t('walks.requestWalk')}
                  onPress={() => Alert.alert(t('common.comingSoon'), t('dogs.requestWalkComing'))}
                />
                {(dog.status === 'adoption' || dog.status === 'both') && (
                  <Button
                    title={t('adoption.requestAdoption')}
                    onPress={() => Alert.alert(t('common.comingSoon'), t('dogs.requestAdoptionComing'))}
                    variant="secondary"
                  />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function InfoItem({
  label,
  value,
  textColor,
  labelColor,
}: {
  label: string;
  value: string;
  textColor: string;
  labelColor: string;
}) {
  return (
    <View style={infoStyles.item}>
      <Text style={[infoStyles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  item: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPhoto: {
    width: '100%',
    height: 250,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  content: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  ownerCard: {
    marginBottom: 16,
  },
  ownerLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerInfo: {
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  ownerRole: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  map: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  actions: {
    gap: 12,
  },
});
