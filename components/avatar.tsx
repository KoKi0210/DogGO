import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Shadows } from '@/constants/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const card = useThemeColor({}, 'card');

  const outerSize = size + 6;
  const shadow = Shadows.claySm[0];

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const ring = (
    <View
      style={[
        styles.ring,
        shadow,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          backgroundColor: card,
        },
      ]}
    />
  );

  if (uri) {
    return (
      <View style={{ width: outerSize, height: outerSize }}>
        {ring}
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              top: 3,
              left: 3,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={{ width: outerSize, height: outerSize }}>
      {ring}
      <LinearGradient
        colors={[primary, primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: 3,
            left: 3,
          },
        ]}>
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {initials}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  image: {
    position: 'absolute',
    resizeMode: 'cover',
  },
  fallback: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
