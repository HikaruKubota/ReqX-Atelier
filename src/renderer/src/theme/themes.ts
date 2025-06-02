import type { Theme } from './types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    card: '#ffffff',
    cardForeground: '#000000',
    popover: '#ffffff',
    popoverForeground: '#000000',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#f3f4f6',
    secondaryForeground: '#1f2937',
    muted: '#f9fafb',
    mutedForeground: '#6b7280',
    accent: '#f3f4f6',
    accentForeground: '#1f2937',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#e5e7eb',
    input: '#e5e7eb',
    ring: '#3b82f6',
    selection: '#dbeafe',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#111827',
    foreground: '#f9fafb',
    card: '#1f2937',
    cardForeground: '#f9fafb',
    popover: '#1f2937',
    popoverForeground: '#f9fafb',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#374151',
    secondaryForeground: '#f9fafb',
    muted: '#374151',
    mutedForeground: '#9ca3af',
    accent: '#374151',
    accentForeground: '#f9fafb',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    border: '#374151',
    input: '#374151',
    ring: '#3b82f6',
    selection: '#1e40af',
  },
};

export const sepiaTheme: Theme = {
  name: 'sepia',
  colors: {
    background: '#fef3c7',
    foreground: '#451a03',
    card: '#fde68a',
    cardForeground: '#451a03',
    popover: '#fde68a',
    popoverForeground: '#451a03',
    primary: '#92400e',
    primaryForeground: '#ffffff',
    secondary: '#fcd34d',
    secondaryForeground: '#451a03',
    muted: '#fde68a',
    mutedForeground: '#78350f',
    accent: '#fcd34d',
    accentForeground: '#451a03',
    destructive: '#991b1b',
    destructiveForeground: '#ffffff',
    border: '#f59e0b',
    input: '#f59e0b',
    ring: '#92400e',
    selection: '#fbbf24',
  },
};

export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
};

export const defaultTheme = 'light';