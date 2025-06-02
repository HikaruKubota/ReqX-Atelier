import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { themes } from './themes';
import type { Theme, ThemeColors } from './types';
import { useThemeStore } from '../store/themeStore';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Remove all theme classes
  Object.keys(themes).forEach((themeName) => {
    root.classList.remove(themeName);
  });

  // Add current theme class
  root.classList.add(theme.name);

  // Apply theme colors as CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Set data-theme attribute for custom styling
  root.setAttribute('data-theme', theme.name);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeName = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const theme = useMemo(() => {
    return themes[themeName] || themes.light;
  }, [themeName]);

  const availableThemes = useMemo(() => Object.keys(themes), []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colors: theme.colors, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
