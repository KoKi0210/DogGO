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

  const safeDistanceKm = Number.isFinite(distanceKm) ? distanceKm : 0;
  const safeDurationMins = Number.isFinite(durationMins) ? durationMins : 0;
  const computedSpeed = safeDurationMins > 0 ? (safeDistanceKm / (safeDurationMins / 60)) : 0;
  const speed = typeof avgSpeed === 'number' && Number.isFinite(avgSpeed) ? avgSpeed : computedSpeed;

  function formatLiveDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const shouldUseLiveFormat = liveFormat && durationSeconds != null;
  const shouldUseClockDuration = durationAsClock || shouldUseLiveFormat;
  const durationValueSeconds = durationSeconds ?? Math.max(0, Math.round(safeDurationMins * 60));
  const distanceText = safeDistanceKm.toFixed(2);
  const durationText = shouldUseClockDuration
    ? formatLiveDuration(durationValueSeconds)
    : String(Math.round(safeDurationMins));
  const distanceLabel = t('walks.km');
  const durationLabel = shouldUseClockDuration ? t('walks.time') : t('walks.min');
  const useLiveTiles = shouldUseLiveFormat;

  const distanceTileStyle = [styles.tile, { backgroundColor: surfacePrimary }];
  const durationTileStyle = [styles.tile, { backgroundColor: text + '08', borderColor: text + '20' }];
  const speedTileStyle = [styles.tile, { backgroundColor: surfaceAccent }];

  return (
    <View style={styles.container}>
      {useLiveTiles ? (
        <View style={distanceTileStyle}>
          <Text style={[styles.value, { color: primary }]}>{distanceText}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>{distanceLabel}</Text>
        </View>
      ) : (
        <Card shadowLevel="sm" style={[styles.card, { backgroundColor: surfacePrimary }]}>
          <Text style={[styles.value, { color: primary }]}>{distanceText}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>{distanceLabel}</Text>
        </Card>
      )}

      {useLiveTiles ? (
        <View style={durationTileStyle}>
          <Text style={[styles.value, { color: text }]}>{durationText}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>{durationLabel}</Text>
        </View>
      ) : (
        <Card shadowLevel="sm" style={styles.card}>
          <Text style={[styles.value, { color: text }]}>{durationText}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>{durationLabel}</Text>
        </Card>
      )}

      {useLiveTiles ? (
        <View style={speedTileStyle}>
          <Text style={[styles.value, { color: accent }]}>{speed.toFixed(1)}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>{t('walks.kmh')}</Text>
        </View>
      ) : (
        <Card shadowLevel="sm" style={[styles.card, { backgroundColor: surfaceAccent }]}>
          <Text style={[styles.value, { color: accent }]}>{speed.toFixed(1)}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>{t('walks.kmh')}</Text>
        </Card>
      )}

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
  tile: {
    flex: 1,
    minHeight: 74,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    includeFontPadding: false,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
