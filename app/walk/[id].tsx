import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function WalkDetailScreen() {
  const { t } = useTranslation();
  const background = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ThemedText type="title">{t('common.comingSoon')}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
