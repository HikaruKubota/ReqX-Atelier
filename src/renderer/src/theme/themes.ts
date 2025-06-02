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
    muted: '#f8fafc',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    border: '#e2e8f0',
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
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    muted: '#404040',
    mutedForeground: '#d4d4d8',
    accent: '#27272a',
    accentForeground: '#fafafa',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#3f3f46',
    input: '#18181b',
    ring: '#3b82f6',
    selection: '#1e3a8a',
  },
};

export const sepiaTheme: Theme = {
  name: 'sepia',
  colors: {
    background: '#faf8f3',
    foreground: '#3e2723',
    card: '#f5f0e6',
    cardForeground: '#3e2723',
    popover: '#f5f0e6',
    popoverForeground: '#3e2723',
    primary: '#8b6914',
    primaryForeground: '#ffffff',
    secondary: '#ede4d3',
    secondaryForeground: '#3e2723',
    muted: '#ede4d3',
    mutedForeground: '#6d4c41',
    accent: '#ede4d3',
    accentForeground: '#3e2723',
    destructive: '#b71c1c',
    destructiveForeground: '#ffffff',
    border: '#d7ccc8',
    input: '#faf8f3',
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
