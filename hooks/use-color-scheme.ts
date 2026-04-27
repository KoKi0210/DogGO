import { useThemePreference } from '@/contexts/theme-context';

export function useColorScheme() {
  const { effectiveScheme } = useThemePreference();
  return effectiveScheme;
}
