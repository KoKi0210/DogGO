import { Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ClayCard } from '@/components/clay-card';
import { Radius } from '@/constants/theme';
import { SPRING_IN, SPRING_OUT } from '@/constants/animations';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  shadowLevel?: 'sm' | 'md' | 'lg';
  radius?: number;
}

export function Card({
  children,
  onPress,
  style,
  shadowLevel = 'md',
  radius = Radius.lg,
}: CardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <ClayCard shadowLevel={shadowLevel} radius={radius} style={[styles.card, style]}>
      {children}
    </ClayCard>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => {
            scale.value = withSpring(0.96, SPRING_IN);
          }}
          onPressOut={() => {
            scale.value = withSpring(1, SPRING_OUT);
          }}>
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
});
