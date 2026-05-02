import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { uploadImage, deleteImage } from '@/lib/storage';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarBase64(result.assets[0].base64 ?? null);
      setAvatarPreview(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!user) return;
    if (!displayName.trim()) {
      Alert.alert(t('common.error'), t('auth.nameRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;

      if (avatarBase64) {
        const newUrl = await uploadImage('avatars', avatarBase64, `${user.id}/avatar`);
        if (newUrl) {
          if (avatarUrl) await deleteImage(avatarUrl);
          avatarUrl = newUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
      router.back();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: t('profile.editProfile') }} />
      <ScrollView
        style={[styles.container, { backgroundColor: background }]}
        contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar uri={avatarPreview} name={displayName} size={100} />
          <Button
            title={t('profile.changePhoto')}
            onPress={pickAvatar}
            variant="outline"
            style={styles.photoBtn}
          />
        </View>

        <Text style={[styles.label, { color: text }]}>{t('auth.displayName')}</Text>
        <Input
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('auth.displayName')}
        />

        <View style={styles.actions}>
          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={isSubmitting}
          />
          <Button
            title={t('common.cancel')}
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 16 },
  avatarSection: { alignItems: 'center', gap: 12 },
  photoBtn: { paddingHorizontal: 16 },
  label: { fontSize: 14, fontWeight: '600' },
  actions: { gap: 12, marginTop: 8 },
});
