import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
// Lazily require expo-secure-store to avoid runtime errors when the
// native module isn't available (e.g. running in Expo Go without the
// module or in non-native environments).
const safeSecureStoreLocal = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-secure-store');
  } catch (e) {
    return null;
  }
};
import { Colors } from '@/constants/theme';
import { UIThemeProvider } from '@mycsuite/ui';

const THEME_PREF_KEY = 'theme-preference';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => Promise<void>;
  effectiveScheme: 'light' | 'dark';
};

export const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = rnUseColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    (async () => {
      try {
        const SecureStore = safeSecureStoreLocal();
        if (!SecureStore || !SecureStore.getItemAsync) return;
        const stored = await SecureStore.getItemAsync(THEME_PREF_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const setPreference = async (p: ThemePreference) => {
    try {
      const SecureStore = safeSecureStoreLocal();
      if (SecureStore && SecureStore.setItemAsync) {
        await SecureStore.setItemAsync(THEME_PREF_KEY, p);
      }
    } catch (e) {
      // ignore
    }
    setPreferenceState(p);
  };

  const effectiveScheme: 'light' | 'dark' = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = effectiveScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference, effectiveScheme }}>
      <UIThemeProvider value={theme}>{children}</UIThemeProvider>
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = () => {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) throw new Error('useThemePreference must be used within AppThemeProvider');
  return ctx;
};

export default AppThemeProvider;
