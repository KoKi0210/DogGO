import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  effectiveScheme: 'light' | 'dark';
  setPreference: (pref: ThemePreference) => void;
  isReady: boolean;
}

const STORAGE_KEY = '@doggo/theme-preference';

const ThemePreferenceContext = createContext<ThemeContextValue>({
  preference: 'system',
  effectiveScheme: 'light',
  setPreference: () => {},
  isReady: false,
});

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setIsReady(true);
    });
  }, []);

  function setPreference(pref: ThemePreference) {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }

  const effectiveScheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme ?? 'light') : preference;

  return (
    <ThemePreferenceContext.Provider value={{ preference, effectiveScheme, setPreference, isReady }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
