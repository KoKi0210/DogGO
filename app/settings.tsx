import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/card';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  async function changeLanguage(lang: string) {
    await i18n.changeLanguage(lang);
    if (profile) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', profile.id);
    }
  }

  const currentLang = i18n.language;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={styles.content}>
      <Card>
        <Text style={[styles.sectionTitle, { color: text }]}>{t('settings.language')}</Text>
        <View style={styles.languageOptions}>
          <Pressable
            onPress={() => changeLanguage('en')}
            style={[
              styles.languageOption,
              { borderColor: currentLang === 'en' ? primary : border },
            ]}>
            <Text style={[styles.languageText, { color: text }]}>
              🇬🇧 {t('settings.english')}
            </Text>
            {currentLang === 'en' && (
              <Text style={[styles.check, { color: primary }]}>✓</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => changeLanguage('bg')}
            style={[
              styles.languageOption,
              { borderColor: currentLang === 'bg' ? primary : border },
            ]}>
            <Text style={[styles.languageText, { color: text }]}>
              🇧🇬 {t('settings.bulgarian')}
            </Text>
            {currentLang === 'bg' && (
              <Text style={[styles.check, { color: primary }]}>✓</Text>
            )}
          </Pressable>
        </View>
      </Card>

      <Card style={styles.aboutCard}>
        <Text style={[styles.sectionTitle, { color: text }]}>{t('settings.about')}</Text>
        <Text style={[styles.aboutText, { color: textSecondary }]}>
          {t('settings.version')} {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageOptions: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  languageText: {
    fontSize: 16,
  },
  check: {
    fontSize: 18,
    fontWeight: '600',
  },
  aboutCard: {
    marginTop: 0,
  },
  aboutText: {
    fontSize: 14,
  },
});
