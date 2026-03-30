import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius } from '@/constants/theme';

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
  const primary = useThemeColor({}, 'primary');

  const [focused, setFocused] = useState(false);

  const activeBorder = error ? errorColor : focused ? primary : border;
  const activeBorderWidth = focused && !error ? 2 : 1;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            color: text,
            backgroundColor: card,
            borderColor: activeBorder,
            borderWidth: activeBorderWidth,
          },
          style,
        ]}
        placeholderTextColor={textSecondary}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
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
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
    marginTop: 4,
  },
});
