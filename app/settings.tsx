import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { useThemePreference, ThemePreference } from '@/contexts/theme-context';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/card';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { preference, setPreference } = useThemePreference();
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

      <Card>
        <Text style={[styles.sectionTitle, { color: text }]}>{t('settings.theme')}</Text>
        <View style={styles.languageOptions}>
          {([
            { key: 'system' as ThemePreference, label: t('settings.themeSystem'), icon: 'phone-portrait-outline' as const },
            { key: 'light' as ThemePreference, label: t('settings.themeLight'), icon: 'sunny-outline' as const },
            { key: 'dark' as ThemePreference, label: t('settings.themeDark'), icon: 'moon-outline' as const },
          ]).map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setPreference(opt.key)}
              style={[
                styles.languageOption,
                { borderColor: preference === opt.key ? primary : border },
              ]}>
              <View style={styles.themeRow}>
                <Ionicons name={opt.icon} size={20} color={text} style={styles.themeIcon} />
                <Text style={[styles.languageText, { color: text }]}>{opt.label}</Text>
              </View>
              {preference === opt.key && (
                <Text style={[styles.check, { color: primary }]}>✓</Text>
              )}
            </Pressable>
          ))}
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
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 10,
  },
});
