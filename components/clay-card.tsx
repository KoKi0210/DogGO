import { View, type ViewStyle, type StyleProp, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Shadows, Radius } from '@/constants/theme';

interface ClayCardProps {
  children: React.ReactNode;
  shadowLevel?: 'sm' | 'md' | 'lg';
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function ClayCard({
  children,
  shadowLevel = 'md',
  radius = Radius.lg,
  style,
}: ClayCardProps) {
  const card = useThemeColor({}, 'card');
  const layers = Shadows[shadowLevel === 'sm' ? 'claySm' : shadowLevel === 'lg' ? 'clayLg' : 'clayMd'];

  const reversed = [...layers].reverse();

  let content = (
    <View style={[styles.surface, { borderRadius: radius, backgroundColor: card }, style]}>
      {children}
    </View>
  );

  for (const layer of reversed) {
    content = (
      <View style={[styles.shadowLayer, { borderRadius: radius }, layer]}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  shadowLayer: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  surface: {
    overflow: 'visible',
  },
});
