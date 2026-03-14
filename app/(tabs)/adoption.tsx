import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AdoptionScreen() {
  const { t } = useTranslation();
  const background = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <EmptyState
        icon="❤️"
        title={t('adoption.noAdoptions')}
        message={t('adoption.noAdoptionsMessage')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
