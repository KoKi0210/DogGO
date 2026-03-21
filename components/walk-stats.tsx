import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Card } from '@/components/card';

interface WalkStatsProps {
  distanceKm: number;
  durationMins: number;
  /** Average speed in km/h. If not provided, calculated from distance/duration. */
  avgSpeed?: number;
  /** Points earned (only shown if provided). */
  pointsEarned?: number;
}

export function WalkStats({ distanceKm, durationMins, avgSpeed, pointsEarned }: WalkStatsProps) {
  const { t } = useTranslation();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');

  const speed = avgSpeed ?? (durationMins > 0 ? (distanceKm / (durationMins / 60)) : 0);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={[styles.value, { color: primary }]}>
          {distanceKm.toFixed(2)}
        </Text>
        <Text style={[styles.label, { color: textSecondary }]}>
          {t('walks.km')}
        </Text>
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.value, { color: text }]}>
          {Math.round(durationMins)}
        </Text>
        <Text style={[styles.label, { color: textSecondary }]}>
          {t('walks.min')}
        </Text>
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.value, { color: accent }]}>
          {speed.toFixed(1)}
        </Text>
        <Text style={[styles.label, { color: textSecondary }]}>
          {t('walks.kmh')}
        </Text>
      </Card>
      {pointsEarned != null && (
        <Card style={styles.card}>
          <Text style={[styles.value, { color: primary }]}>
            {pointsEarned}
          </Text>
          <Text style={[styles.label, { color: textSecondary }]}>pts</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
