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
import { signIn } from '@/lib/auth';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const background = useThemeColor({}, 'background');

  function validate() {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.invalidEmail');
    if (!password) newErrors.password = t('auth.passwordRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
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
          {/* Decorative blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />
          <Text style={[styles.logo, { color: primary }]}>DogGO</Text>
          <Text style={[styles.title, { color: text }]}>{t('auth.loginTitle')}</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        <View style={styles.form}>
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
            autoComplete="password"
          />
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textSecondary }]}>
            {t('auth.noAccount')}{' '}
          </Text>
          <Link href="/(auth)/register" style={[styles.link, { color: primary }]}>
            {t('auth.register')}
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
    overflow: 'visible',
  },
  blob1: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B3520',
  },
  blob2: {
    position: 'absolute',
    top: -20,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2EC4B620',
  },
  blob3: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#004E8920',
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
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
