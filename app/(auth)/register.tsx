import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const background = useThemeColor({}, 'background');

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = t('auth.nameRequired');
    if (!email.trim()) newErrors.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.invalidEmail');
    if (!password) newErrors.password = t('auth.passwordRequired');
    else if (password.length < 6) newErrors.password = t('auth.passwordMin');
    if (password !== confirmPassword) newErrors.confirmPassword = t('auth.passwordsNoMatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.logo, { color: primary }]}>DogGO</Text>
          <Text style={[styles.title, { color: text }]}>{t('auth.registerTitle')}</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            {t('auth.registerSubtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.displayName')}
            value={displayName}
            onChangeText={setDisplayName}
            error={errors.displayName}
            autoCapitalize="words"
          />
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoComplete="new-password"
          />
          <Input
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
          />
          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textSecondary }]}>
            {t('auth.hasAccount')}{' '}
          </Text>
          <Link href="/(auth)/login" style={[styles.link, { color: primary }]}>
            {t('auth.login')}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
