/**
 * DogGO theme — Claymorphism design system.
 */

import { ViewStyle } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFF8F5',
    tint: '#FF6B35',
    primary: '#FF6B35',
    primaryLight: '#FF9A6C',
    secondary: '#004E89',
    secondaryLight: '#2E6FA8',
    accent: '#2EC4B6',
    error: '#F44336',
    card: '#FFFFFF',
    border: '#E0E0E0',
    textSecondary: '#687076',
    surfacePrimary: '#FFF0EA',
    surfaceSecondary: '#E8F0FA',
    surfaceAccent: '#E8FAF8',
    surfacePrimaryEnd: '#FFE0D0',
    surfaceAccentEnd: '#D0F4F0',
    medalGold: '#FFF4D0',
    medalGoldEnd: '#FFE57F',
    medalSilver: '#F0F0F0',
    medalSilverEnd: '#D8D8D8',
    medalBronze: '#FDE8D8',
    medalBronzeEnd: '#F4C49A',
    medalText: '#11181C',
    placeholder: '#F0F0F0',
    textOnPrimary: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1210',
    tint: '#FF6B35',
    primary: '#FF6B35',
    primaryLight: '#FF9A6C',
    secondary: '#3A8FD6',
    secondaryLight: '#5AAAE6',
    accent: '#2EC4B6',
    error: '#EF5350',
    card: '#241C1A',
    border: '#2C2F33',
    textSecondary: '#9BA1A6',
    surfacePrimary: '#3D2118',
    surfaceSecondary: '#0D1E30',
    surfaceAccent: '#0A2825',
    surfacePrimaryEnd: '#4A2A1A',
    surfaceAccentEnd: '#1A3A35',
    medalGold: '#4A3A10',
    medalGoldEnd: '#6B5520',
    medalSilver: '#2A2A2E',
    medalSilverEnd: '#3A3A3E',
    medalBronze: '#3D2518',
    medalBronzeEnd: '#5A3A28',
    medalText: '#ECEDEE',
    placeholder: '#2C2520',
    textOnPrimary: '#FFFFFF',
  },
};

export const Radius = {
  md: 16,
  lg: 24,
} as const;

type ShadowLayer = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const Shadows: Record<'claySm' | 'clayMd' | 'clayLg', ShadowLayer[]> = {
  claySm: [
    { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3 },
    { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 5 },
  ],
  clayMd: [
    { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
    { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
    { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  ],
  clayLg: [
    { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 8 },
    { shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 14 },
    { shadowColor: '#FF9A6C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  ],
};

