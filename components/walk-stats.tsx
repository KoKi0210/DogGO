import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Card } from '@/components/card';

interface WalkStatsProps {
  distanceKm: number;
  durationMins: number;
  durationSeconds?: number;
  liveFormat?: boolean;
  durationAsClock?: boolean;
  avgSpeed?: number;
  pointsEarned?: number;
}

export function WalkStats({
  distanceKm,
  durationMins,
  durationSeconds,
  liveFormat,
  durationAsClock,
  avgSpeed,
  pointsEarned,
}: WalkStatsProps) {
  const { t } = useTranslation();
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');
  const surfaceAccent = useThemeColor({}, 'surfaceAccent');

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
  const shouldUseClockDuration = durationAsClock || shouldUseLiveFormat;
  const durationValueSeconds = durationSeconds ?? Math.max(0, Math.round(durationMins * 60));
  const distanceText = shouldUseLiveFormat ? formatLiveDistance(distanceKm) : distanceKm.toFixed(2);
  const durationText = shouldUseClockDuration
    ? formatLiveDuration(durationValueSeconds)
    : String(Math.round(durationMins));
  const distanceLabel = shouldUseLiveFormat ? 'KM:MM' : t('walks.km');
  const durationLabel = shouldUseClockDuration ? 'HH:MM:SS' : t('walks.min');

  return (
    <View style={styles.container}>
      <Card shadowLevel="sm" style={[styles.card, { backgroundColor: surfacePrimary }]}>
        <Text style={[styles.value, { color: primary }]}>{distanceText}</Text>
        <Text style={[styles.label, { color: textSecondary }]}>{distanceLabel}</Text>
      </Card>
      <Card shadowLevel="sm" style={styles.card}>
        <Text style={[styles.value, { color: text }]}>{durationText}</Text>
        <Text style={[styles.label, { color: textSecondary }]}>{durationLabel}</Text>
      </Card>
      <Card shadowLevel="sm" style={[styles.card, { backgroundColor: surfaceAccent }]}>
        <Text style={[styles.value, { color: accent }]}>{speed.toFixed(1)}</Text>
        <Text style={[styles.label, { color: textSecondary }]}>{t('walks.kmh')}</Text>
      </Card>
      {pointsEarned != null && (
        <Card shadowLevel="sm" style={[styles.card, { backgroundColor: surfacePrimary }]}>
          <Text style={[styles.value, { color: primary }]}>{pointsEarned}</Text>
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
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
