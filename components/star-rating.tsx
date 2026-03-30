import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, size = 28, editable = false, onChange }: StarRatingProps) {
  const selectedColor = useThemeColor({}, 'primary');
  const emptyColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starIndex = i + 1;
        const filled = starIndex <= rating;

        return (
          <Pressable
            key={starIndex}
            onPress={() => editable && onChange?.(starIndex)}
            disabled={!editable}
            style={styles.star}>
            <Text
              style={{
                fontSize: size,
                lineHeight: size + 6,
                color: filled ? selectedColor : emptyColor,
              }}>
              {filled ? '★' : '☆'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 2 },
  star: { padding: 2 },
});
