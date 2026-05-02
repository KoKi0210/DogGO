import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { ClayCard } from '@/components/clay-card';
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
  const primaryLight = useThemeColor({}, 'primaryLight');
  const accent = useThemeColor({}, 'accent');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const surfaceAccent = useThemeColor({}, 'surfaceAccent');
  const surfacePrimaryEnd = useThemeColor({}, 'surfacePrimaryEnd');
  const surfaceAccentEnd = useThemeColor({}, 'surfaceAccentEnd');

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
      <LinearGradient
        colors={[primary, primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}>
        <View style={styles.headerBlob1} />
        <View style={styles.headerBlob2} />
      </LinearGradient>

      <View style={styles.avatarWrapper}>
        <Avatar uri={profile?.avatar_url} name={profile?.display_name} size={80} />
      </View>

      <View style={styles.nameSection}>
        <Text style={[styles.displayName, { color: text }]}>
          {profile?.display_name ?? user?.email}
        </Text>
        <View style={[styles.rolePill, { backgroundColor: surfacePrimary }]}>
          <Text style={[styles.role, { color: primary }]}>
            {profile?.role ?? 'user'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <ClayCard shadowLevel="md" radius={20} style={{ flex: 1, padding: 0 }}>
          <LinearGradient
            colors={[surfacePrimary, surfacePrimaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCardInner}>
            <Text style={[styles.statValue, { color: primary }]}>
              {profile?.total_points ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>
              {t('profile.points')}
            </Text>
          </LinearGradient>
        </ClayCard>
        <ClayCard shadowLevel="md" radius={20} style={{ flex: 1, padding: 0 }}>
          <LinearGradient
            colors={[surfaceAccent, surfaceAccentEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCardInner}>
            <Text style={[styles.statValue, { color: accent }]}>
              {profile?.streak_count ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>
              {t('profile.streak')}
            </Text>
          </LinearGradient>
        </ClayCard>
      </View>

      <View style={styles.sections}>
        <ProfileSectionRow
          emoji="pawprint.fill"
          title={t('profile.myDogs')}
          count={dogs.length}
          onPress={() => router.push('/profile/dogs')}
        />
        <ProfileSectionRow
          emoji="figure.walk"
          title={t('profile.myWalks')}
          count={walks.length}
          subtitle={activeWalkCount > 0 ? t('profile.activeCount', { count: activeWalkCount }) : undefined}
          onPress={() => router.push('/profile/walks')}
        />
        {pendingWalks.length > 0 && (
          <ProfileSectionRow
            emoji="bell.fill"
            title={t('profile.pendingRequests')}
            count={pendingWalks.length}
            showBadge
            onPress={() => router.push('/profile/pending')}
          />
        )}
        {totalAdoptions > 0 && (
          <ProfileSectionRow
            emoji="heart.fill"
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
  content: { paddingBottom: 120 },
  gradientHeader: {
    height: 200,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlob1: {
    position: 'absolute',
    top: 20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerBlob2: {
    position: 'absolute',
    bottom: -10,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -40,
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  displayName: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  rolePill: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  role: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24, paddingHorizontal: 24 },
  statCardInner: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  statValue: { fontSize: 32, fontWeight: '900' },
  statLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  sections: { marginBottom: 24, paddingHorizontal: 24 },
  actions: { gap: 12, paddingHorizontal: 24 },
});
