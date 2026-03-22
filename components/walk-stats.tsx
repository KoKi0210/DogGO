import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Card } from '@/components/card';

interface WalkStatsProps {
  distanceKm: number;
  durationMins: number;
  durationSeconds?: number;
  liveFormat?: boolean;
  /** Average speed in km/h. If not provided, calculated from distance/duration. */
  avgSpeed?: number;
  /** Points earned (only shown if provided). */
  pointsEarned?: number;
}

export function WalkStats({
  distanceKm,
  durationMins,
  durationSeconds,
  liveFormat,
  avgSpeed,
  pointsEarned,
}: WalkStatsProps) {
  const { t } = useTranslation();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');

  const speed = avgSpeed ?? (durationMins > 0 ? (distanceKm / (durationMins / 60)) : 0);

  function formatLiveDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function formatLiveDistance(kmValue: number) {
    const wholeKm = Math.floor(kmValue);
    const mm = Math.floor((kmValue - wholeKm) * 100);
    return `${wholeKm}:${String(mm).padStart(2, '0')}`;
  }

  const shouldUseLiveFormat = liveFormat && durationSeconds != null;
  const distanceText = shouldUseLiveFormat ? formatLiveDistance(distanceKm) : distanceKm.toFixed(2);
  const durationText = shouldUseLiveFormat
    ? formatLiveDuration(durationSeconds)
    : String(Math.round(durationMins));
  const distanceLabel = shouldUseLiveFormat ? 'KM:MM' : t('walks.km');
  const durationLabel = shouldUseLiveFormat ? 'HH:MM:SS' : t('walks.min');

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={[styles.value, { color: primary }]}>
          {distanceText}
        </Text>
        <Text style={[styles.label, { color: textSecondary }]}>
          {distanceLabel}
        </Text>
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.value, { color: text }]}>
          {durationText}
        </Text>
        <Text style={[styles.label, { color: textSecondary }]}>
          {durationLabel}
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
