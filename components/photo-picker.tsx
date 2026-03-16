import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IMAGE_PICKER } from '@/constants/layout';

interface PhotoPickerProps {
  uri: string | null;
  onPick: (uri: string, base64: string) => void;
  error?: string;
}

export function PhotoPicker({ uri, onPick, error }: PhotoPickerProps) {
  const { t } = useTranslation();
  const textSecondary = useThemeColor({}, 'textSecondary');
  const errorColor = useThemeColor({}, 'error');
  const border = useThemeColor({}, 'border');

  const [isLoading, setIsLoading] = useState(false);

  const imageOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: IMAGE_PICKER.ASPECT_RATIO,
    quality: IMAGE_PICKER.QUALITY,
    base64: true,
  };

  async function handleMedia(source: 'camera' | 'library') {
    try {
      setIsLoading(true);

      const isCamera = source === 'camera';
      const { status } = isCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('common.error'),
          t(isCamera ? 'dogs.cameraPermissionDenied' : 'dogs.photoPermissionDenied')
        );
        return;
      }

      const result = isCamera
        ? await ImagePicker.launchCameraAsync(imageOptions)
        : await ImagePicker.launchImageLibraryAsync(imageOptions);

      if (!result.canceled && result.assets[0].base64) {
        onPick(result.assets[0].uri, result.assets[0].base64);
      }
    } catch (err) {
      console.error(`Error ${source === 'camera' ? 'taking photo' : 'picking image'}:`, err);
      Alert.alert(
        t('common.error'),
        t(source === 'camera' ? 'dogs.photoTakeError' : 'dogs.photoPickError')
      );
    } finally {
      setIsLoading(false);
    }
  }

  function showOptions() {
    Alert.alert(
      t('dogs.selectPhoto'),
      undefined,
      [
        { text: t('dogs.takePhoto'), onPress: () => handleMedia('camera') },
        { text: t('dogs.chooseFromLibrary'), onPress: () => handleMedia('library') },
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textSecondary }]}>
        {t('dogs.photo')}
        <Text style={{ color: errorColor }}> *</Text>
      </Text>
      <Pressable
        style={[
          styles.picker,
          { borderColor: error ? errorColor : border },
          uri && styles.pickerWithImage,
        ]}
        onPress={showOptions}
        disabled={isLoading}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>📷</Text>
            <Text style={[styles.placeholderText, { color: textSecondary }]}>
              {t('dogs.addPhoto')}
            </Text>
          </View>
        )}
      </Pressable>
      {error && <Text style={[styles.error, { color: errorColor }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  picker: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  pickerWithImage: {
    borderStyle: 'solid',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
