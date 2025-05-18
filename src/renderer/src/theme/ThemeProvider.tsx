import React, { createContext, useContext, useEffect } from 'react';
import { darkColors, lightColors } from './colors';
import type { ThemeColors } from '../types';
import { useThemeStore } from '../store/themeStore';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const applyColors = (colors: ThemeColors) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const colors = mode === 'light' ? lightColors : darkColors;

  useEffect(() => {
    applyColors(colors);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode, colors]);

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleMode }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
