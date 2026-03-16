import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface LoadingProps {
  fullScreen?: boolean;
}

export function Loading({ fullScreen = false }: LoadingProps) {
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return <ActivityIndicator size="small" color={primary} style={styles.inline} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: 16,
  },
});
