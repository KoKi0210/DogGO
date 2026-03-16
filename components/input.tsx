import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const errorColor = useThemeColor({}, 'error');

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            color: text,
            backgroundColor: card,
            borderColor: error ? errorColor : border,
          },
          style,
        ]}
        placeholderTextColor={textSecondary}
        {...props}
      />
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
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
