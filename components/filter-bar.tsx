import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Shadows } from '@/constants/theme';
import { DogSize } from '@/types/database';

interface FilterBarProps {
  selectedSizes: DogSize[];
  onToggleSize: (size: DogSize) => void;
  maxDistance: number | null;
  onChangeDistance: (distance: number | null) => void;
}

const SIZES: DogSize[] = ['small', 'medium', 'large'];
const DISTANCES = [1, 5, 10, null]; // null = any

export function FilterBar({ selectedSizes, onToggleSize, maxDistance, onChangeDistance }: FilterBarProps) {
  const { t } = useTranslation();
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const chipShadow = Shadows.claySm[0];

  const renderChip = (
    key: string,
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable key={key} onPress={onPress}>
      {selected ? (
        <LinearGradient
          colors={[primary, primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chip}>
          <Text style={[styles.chipText, { color: '#FFFFFF', fontWeight: '700' }]}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View style={[styles.chip, { backgroundColor: card }, chipShadow]}>
          <Text style={[styles.chipText, { color: text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.size')}:</Text>
        {SIZES.map((size) =>
          renderChip(size, t(`dogs.${size}`), selectedSizes.includes(size), () => onToggleSize(size))
        )}
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: textSecondary }]}>{t('filters.distance')}:</Text>
        {DISTANCES.map((d) =>
          renderChip(
            String(d),
            d === null ? t('filters.any') : `${d} km`,
            maxDistance === d,
            () => onChangeDistance(d),
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { fontSize: 13, fontWeight: '600' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
});
