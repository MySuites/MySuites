import { createContext, useContext } from 'react';

export type AppTheme = {
  primary: string;
  accent: string;
  background: string;
  backgroundMuted?: string;
  backgroundDimmed?: string;
  text: string;
  textMuted?: string;
  surface: string;
  icon?: string;
  tabIconDefault?: string;
  tabIconSelected?: string;
  error?: string;
  [k: string]: any;
};

export const lightTheme: AppTheme = {
  primary: 'hsl(8, 100%, 67%)',
  accent: 'hsl(117, 20%, 61%)',
  background: 'hsl(0, 0%, 100%)',
  backgroundMuted: 'hsl(0, 0%, 95%)',
  backgroundDimmed: 'hsl(0, 0%, 90%)',
  text: 'hsl(0, 0%, 5%)',
  textMuted: 'hsl(0, 0%, 30%)',
  surface: 'hsl(359, 75%, 89%)',
  icon: 'hsl(0, 0%, 5%)',
  tabIconDefault: 'hsl(359, 75%, 89%)',
  tabIconSelected: 'hsl(8, 100%, 67%)',
  error: 'hsl(0, 84%, 60%)',
};

export const darkTheme: AppTheme = {
  primary: 'hsl(8, 100%, 67%)',
  accent: 'hsl(117, 20%, 61%)',
  background: 'hsl(0, 0%, 5%)',
  backgroundMuted: 'hsl(0, 0%, 30%)',
  backgroundDimmed: 'hsl(0, 0%, 25%)',
  text: 'hsl(0, 0%, 100%)',
  textMuted: 'hsl(0, 0%, 70%)',
  surface: 'hsl(359, 75%, 89%)',
  icon: 'hsl(0, 0%, 100%)',
  tabIconDefault: 'hsl(359, 75%, 89%)',
  tabIconSelected: 'hsl(8, 100%, 67%)',
  error: 'hsl(0, 84%, 60%)',
};

// For backward compatibility if needed, or default export
export const defaultTheme = lightTheme;

const ThemeContext = createContext<AppTheme>(defaultTheme);

export const UIThemeProvider = ({ value, children }: { value: AppTheme; children: React.ReactNode }) => {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useUITheme = () => useContext(ThemeContext);

export default ThemeContext;
