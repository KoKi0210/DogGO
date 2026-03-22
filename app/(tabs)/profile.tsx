import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useMyWalks } from '@/hooks/use-my-walks';
import { useMyDogs } from '@/hooks/use-my-dogs';
import { useAdoptionRequests } from '@/hooks/use-adoption-requests';
import { usePendingRequests } from '@/hooks/use-pending-requests';
import { signOut } from '@/lib/auth';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ProfileSectionRow } from '@/components/profile-section-row';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { walks, refresh: refreshWalks } = useMyWalks();
  const { dogs, refresh: refreshDogs } = useMyDogs();
  const { sent: sentAdoptions, received: receivedAdoptions, refresh: refreshAdoptions } = useAdoptionRequests();
  const { pendingWalks, refresh: refreshPending } = usePendingRequests();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');

  useFocusEffect(
    useCallback(() => {
      refreshWalks();
      refreshDogs();
      refreshAdoptions();
      refreshPending();
    }, [refreshWalks, refreshDogs, refreshAdoptions, refreshPending])
  );

  async function handleLogout() {
    try {
      await signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  const activeWalkCount = walks.filter((w) => w.status === 'active').length;
  const totalAdoptions = sentAdoptions.length + receivedAdoptions.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <Avatar uri={profile?.avatar_url} name={profile?.display_name} size={80} />
        <Text style={[styles.displayName, { color: text }]}>
          {profile?.display_name ?? user?.email}
        </Text>
        <Text style={[styles.role, { color: textSecondary }]}>
          {profile?.role ?? 'user'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: primary }]}>
            {profile?.total_points ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {t('profile.points')}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: accent }]}>
            {profile?.streak_count ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {t('profile.streak')}
          </Text>
        </Card>
      </View>

      {/* Section rows */}
      <View style={styles.sections}>
        <ProfileSectionRow
          emoji="🐕"
          title={t('profile.myDogs')}
          count={dogs.length}
          onPress={() => router.push('/profile/dogs')}
        />
        <ProfileSectionRow
          emoji="🚶"
          title={t('profile.myWalks')}
          count={walks.length}
          subtitle={activeWalkCount > 0 ? t('profile.activeCount', { count: activeWalkCount }) : undefined}
          onPress={() => router.push('/profile/walks')}
        />
        {pendingWalks.length > 0 && (
          <ProfileSectionRow
            emoji="📬"
            title={t('profile.pendingRequests')}
            count={pendingWalks.length}
            showBadge
            onPress={() => router.push('/profile/pending')}
          />
        )}
        {totalAdoptions > 0 && (
          <ProfileSectionRow
            emoji="❤️"
            title={t('profile.adoptionRequests')}
            count={totalAdoptions}
            onPress={() => router.push('/profile/adoptions')}
          />
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title={t('profile.editProfile')}
          onPress={() => router.push('/profile/edit')}
          variant="outline"
        />
        <Button
          title={t('profile.settings')}
          onPress={() => router.push('/settings')}
          variant="outline"
        />
        <Button
          title={t('auth.logout')}
          onPress={handleLogout}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  displayName: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  role: { fontSize: 14, marginTop: 4, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sections: { marginBottom: 24 },
  actions: { gap: 12 },
});
