import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Shadows } from '@/constants/theme';
import { DogSize, EnergyLevel } from '@/types/database';

// TODO REMOVE THIS COMPONENT AS IT IS NOT USED
interface FilterBarProps {
  selectedSizes: DogSize[];
  onToggleSize: (size: DogSize) => void;
  maxDistance: number | null;
  onChangeDistance: (distance: number | null) => void;
  energyLevel: EnergyLevel | null;
  onChangeEnergy: (energy: EnergyLevel | null) => void;
}

const SIZES: DogSize[] = ['small', 'medium', 'large'];
const DISTANCES = [1, 5, 10, null] as const;
const ENERGY_LEVELS: EnergyLevel[] = ['low', 'medium', 'high'];

export function FilterBar({
  selectedSizes,
  onToggleSize,
  maxDistance,
  onChangeDistance,
  energyLevel,
  onChangeEnergy,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const card = useThemeColor({}, 'card');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const chipShadow = Shadows.claySm[0];

  const activeCount =
    selectedSizes.length +
    (maxDistance !== null ? 1 : 0) +
    (energyLevel !== null ? 1 : 0);

  const clearAll = () => {
    selectedSizes.forEach((s) => onToggleSize(s));
    onChangeDistance(null);
    onChangeEnergy(null);
  };

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
    <>
      {/* Trigger button */}
      <Pressable onPress={() => setOpen(true)} style={styles.triggerWrapper}>
        <View style={[styles.triggerBtn, { backgroundColor: card }, chipShadow]}>
          <Text style={[styles.triggerIcon, { color: primary }]}>⚙</Text>
          <Text style={[styles.triggerLabel, { color: text }]}>{t('filters.title')}</Text>
          {activeCount > 0 && (
            <LinearGradient
              colors={[primary, primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </LinearGradient>
          )}
        </View>
      </Pressable>

      {/* Bottom-sheet modal */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <SafeAreaView style={[styles.sheet, { backgroundColor: background }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: textSecondary + '40' }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: text }]}>{t('filters.title')}</Text>
            {activeCount > 0 && (
              <Pressable onPress={clearAll}>
                <Text style={[styles.clearAll, { color: primary }]}>{t('filters.clearAll')}</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            {/* Size */}
            <Text style={[styles.rowLabel, { color: textSecondary }]}>{t('dogs.size')}</Text>
            <View style={styles.chipRow}>
              {SIZES.map((size) =>
                renderChip(
                  size,
                  t(`dogs.${size}`),
                  selectedSizes.includes(size),
                  () => onToggleSize(size),
                )
              )}
            </View>

            {/* Energy */}
            <Text style={[styles.rowLabel, { color: textSecondary }]}>{t('filters.energyLevel')}</Text>
            <View style={styles.chipRow}>
              {ENERGY_LEVELS.map((e) =>
                renderChip(
                  e,
                  t(`filters.${e}`),
                  energyLevel === e,
                  () => onChangeEnergy(energyLevel === e ? null : e),
                )
              )}
            </View>

            {/* Distance */}
            <Text style={[styles.rowLabel, { color: textSecondary }]}>{t('filters.distance')}</Text>
            <View style={styles.chipRow}>
              {DISTANCES.map((d) =>
                renderChip(
                  String(d),
                  d === null ? t('filters.any') : `${d} km`,
                  maxDistance === d,
                  () => onChangeDistance(d),
                )
              )}
            </View>
          </ScrollView>

          {/* Done button */}
          <Pressable onPress={() => setOpen(false)} style={styles.doneWrapper}>
            <LinearGradient
              colors={[primary, primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>{t('common.ok')}</Text>
            </LinearGradient>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrapper: { marginBottom: 12 },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  triggerIcon: { fontSize: 15 },
  triggerLabel: { fontSize: 14, fontWeight: '600' },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 8,
    // clip the top corners
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  clearAll: { fontSize: 14, fontWeight: '600' },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 8, gap: 4 },
  rowLabel: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '500' },

  doneWrapper: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  doneBtn: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
