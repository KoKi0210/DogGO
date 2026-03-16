import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useMyDogs } from '@/hooks/use-my-dogs';
import { signOut } from '@/lib/auth';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DogCard } from '@/components/dog-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { HEADER_TOP_PADDING } from '@/constants/layout';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { dogs, refresh } = useMyDogs();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');

  // Refresh dogs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function handleLogout() {
    try {
      await signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <Avatar
          uri={profile?.avatar_url}
          name={profile?.display_name}
          size={80}
        />
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: text }]}>{t('dogs.myDogs')}</Text>
          <Button
            title={t('dogs.addDog')}
            onPress={() => router.push('/dog/add')}
            variant="outline"
            style={styles.addButton}
          />
        </View>
        {dogs.length > 0 ? (
          dogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              showStatusBadge
              onPress={() => router.push(`/dog/${dog.id}`)}
            />
          ))
        ) : (
          <Card>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              {t('profile.noDogs')}
            </Text>
          </Card>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title={t('profile.settings')}
          onPress={() => router.push('/settings')}
          variant="outline"
        />
        <Button
          title={t('auth.logout')}
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: HEADER_TOP_PADDING,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  role: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    height: 36,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  actions: {
    gap: 12,
  },
  logoutButton: {
    marginTop: 0,
  },
});
