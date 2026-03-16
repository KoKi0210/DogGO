import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';

const PERIODS = ['daily', 'weekly', 'monthly', 'allTime'] as const;

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]>('weekly');
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.segmentControl, { backgroundColor: card, borderColor: border }]}>
        {PERIODS.map((period) => (
          <Pressable
            key={period}
            onPress={() => setActivePeriod(period)}
            style={[
              styles.segment,
              activePeriod === period && { backgroundColor: primary },
            ]}>
            <Text
              style={[
                styles.segmentText,
                { color: activePeriod === period ? '#FFFFFF' : textSecondary },
              ]}>
              {t(`leaderboard.${period}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <EmptyState
        icon="🏆"
        title={t('leaderboard.noEntries')}
        message={t('leaderboard.noEntriesMessage')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  segmentControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
