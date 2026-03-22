import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
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
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      {/* Size chips */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: textSecondary }]}>{t('dogs.size')}:</Text>
        {SIZES.map((size) => {
          const selected = selectedSizes.includes(size);
          return (
            <Pressable
              key={size}
              onPress={() => onToggleSize(size)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? primary : card,
                  borderColor: selected ? primary : border,
                },
              ]}>
              <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : text }]}>
                {t(`dogs.${size}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Distance chips */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: textSecondary }]}>{t('filters.distance')}:</Text>
        {DISTANCES.map((d) => {
          const selected = maxDistance === d;
          const label = d === null ? t('filters.any') : `${d} km`;
          return (
            <Pressable
              key={String(d)}
              onPress={() => onChangeDistance(d)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? primary : card,
                  borderColor: selected ? primary : border,
                },
              ]}>
              <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : text }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  label: { fontSize: 13, fontWeight: '500' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
});
