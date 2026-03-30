import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Shadows, Radius } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const SPRING_IN = { damping: 15, stiffness: 400, mass: 0.6 };
const SPRING_OUT = { damping: 10, stiffness: 200, mass: 0.8 };

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const secondary = useThemeColor({}, 'secondary');
  const secondaryLight = useThemeColor({}, 'secondaryLight');
  const error = useThemeColor({}, 'error');

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;

  const textColor = isOutline ? primary : '#FFFFFF';
  const borderColor = isOutline ? primary : 'transparent';

  const gradientColors: [string, string] =
    variant === 'primary'
      ? [primary, primaryLight]
      : variant === 'secondary'
        ? [secondary, secondaryLight]
        : variant === 'danger'
          ? [error, '#FF6B6B']
          : ['transparent', 'transparent'];

  const shadow = Shadows.claySm[0]; // outermost layer for button

  return (
    <Animated.View
      style={[
        animatedStyle,
        !isOutline && !isDisabled && shadow,
        style,
      ]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => {
          scale.value = withSpring(0.94, SPRING_IN);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING_OUT);
        }}>
        {isOutline ? (
          <View
            style={[
              styles.button,
              {
                borderColor,
                borderWidth: 2,
                opacity: isDisabled ? 0.5 : 1,
              },
            ]}>
            {loading ? (
              <ActivityIndicator color={textColor} />
            ) : (
              <Text style={[styles.text, { color: textColor }]}>{title}</Text>
            )}
          </View>
        ) : (
          <LinearGradient
            colors={isDisabled ? ['#CCCCCC', '#BBBBBB'] as [string, string] : gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}>
            {loading ? (
              <ActivityIndicator color={isDisabled ? '#999999' : textColor} />
            ) : (
              <Text
                style={[
                  styles.text,
                  { color: isDisabled ? '#999999' : textColor },
                ]}>
                {title}
              </Text>
            )}
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.md + 4, // 20
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
