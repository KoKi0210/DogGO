/**
 * DogGO theme colors and fonts.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#FF6B35',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#FF6B35',
    primary: '#FF6B35',
    secondary: '#004E89',
    accent: '#2EC4B6',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    card: '#FFFFFF',
    border: '#E0E0E0',
    textSecondary: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FF6B35',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FF6B35',
    primary: '#FF6B35',
    secondary: '#3A8FD6',
    accent: '#2EC4B6',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    card: '#1E2022',
    border: '#2C2F33',
    textSecondary: '#9BA1A6',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
