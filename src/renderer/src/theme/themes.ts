import type { Theme } from './types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    popover: '#ffffff',
    popoverForeground: '#0a0a0a',
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    accent: '#e0e7ff',
    accentForeground: '#1e3a8a',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    border: '#e5e7eb',
    input: '#ffffff',
    ring: '#2563eb',
    selection: '#dbeafe',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#141414',
    cardForeground: '#fafafa',
    popover: '#141414',
    popoverForeground: '#fafafa',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#262626',
    secondaryForeground: '#e5e5e5',
    muted: '#374151',
    mutedForeground: '#e5e7eb',
    accent: '#1e293b',
    accentForeground: '#cbd5e1',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#374151',
    input: '#171717',
    ring: '#3b82f6',
    selection: '#1e3a8a',
  },
};

export const sepiaTheme: Theme = {
  name: 'sepia',
  colors: {
    background: '#faf6f0',
    foreground: '#3e2723',
    card: '#f5ede1',
    cardForeground: '#3e2723',
    popover: '#f5ede1',
    popoverForeground: '#3e2723',
    primary: '#8b6914',
    primaryForeground: '#ffffff',
    secondary: '#ede4d3',
    secondaryForeground: '#5d4037',
    muted: '#e8dcc6',
    mutedForeground: '#6d4c41',
    accent: '#f5e6d3',
    accentForeground: '#5d4037',
    destructive: '#b71c1c',
    destructiveForeground: '#ffffff',
    border: '#d7ccc8',
    input: '#faf6f0',
    ring: '#8b6914',
    selection: '#ffe0b2',
  },
};

export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
};

export const defaultTheme = 'light';
