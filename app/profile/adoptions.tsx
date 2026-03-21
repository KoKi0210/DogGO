import { useCallback } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAdoptionRequests, AdoptionRequestWithDetails } from '@/hooks/use-adoption-requests';
import { AdoptionRequestCard } from '@/components/adoption-request-card';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AdoptionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const { sent, received, isLoading, refresh } = useAdoptionRequests();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const sections = [
    ...(received.length > 0 ? [{ title: t('adoption.requestsReceived'), variant: 'received' as const, data: received }] : []),
    ...(sent.length > 0 ? [{ title: t('adoption.requestsSent'), variant: 'sent' as const, data: sent }] : []),
  ];

  const renderItem = useCallback(({ item, section }: { item: AdoptionRequestWithDetails; section: { variant: 'sent' | 'received' } }) => (
    <AdoptionRequestCard
      request={item}
      variant={section.variant}
      onPress={() => router.push(`/adoption/${item.id}`)}
    />
  ), [router]);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => (
    <Text style={[styles.sectionTitle, { color: text }]}>{section.title}</Text>
  ), [text]);

  const keyExtractor = useCallback((item: AdoptionRequestWithDetails) => item.id, []);

  const isEmpty = sent.length === 0 && received.length === 0;

  return (
    <>
      <Stack.Screen options={{ title: t('profile.adoptionRequests') }} />
      <View style={[styles.container, { backgroundColor: background }]}>
        {isEmpty && !isLoading ? (
          <EmptyState
            icon="❤️"
            title={t('adoption.noAdoptions')}
            message={t('adoption.noAdoptionsMessage')}
          />
        ) : (
          <SectionList
            sections={sections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={primary} />
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 8 },
});
