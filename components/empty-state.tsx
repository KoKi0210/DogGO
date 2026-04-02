import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button } from '@/components/button';
import { Shadows } from '@/constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const text = useThemeColor({}, 'text');
  const surfacePrimary = useThemeColor({}, 'surfacePrimary');

  return (
    <View style={styles.container}>
      {icon && (
        <View style={[styles.iconBlob, { backgroundColor: surfacePrimary }, Shadows.claySm[0]]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      )}
      <Text style={[styles.title, { color: text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: textSecondary }]}>{message}</Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconBlob: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    lineHeight: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
  },
});
