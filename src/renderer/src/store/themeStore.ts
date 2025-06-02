import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultTheme } from '../theme/themes';

export interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      setTheme: (theme: string) => set({ theme }),
    }),
    {
      name: 'reqx_theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
