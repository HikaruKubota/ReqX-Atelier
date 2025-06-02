import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { themes } from '../themes';
import { useThemeStore } from '../../store/themeStore';

const TestComp = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  return (
    <div>
      <button onClick={() => setTheme(theme.name === 'light' ? 'dark' : 'light')}>
        現在:{theme.name}
      </button>
      <select onChange={(e) => setTheme(e.target.value)} value={theme.name}>
        {availableThemes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'dark' });
  });

  it('toggles theme', () => {
    render(
      <ThemeProvider>
        <TestComp />
      </ThemeProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('現在:dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    fireEvent.click(btn);
    expect(btn.textContent).toBe('現在:light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies color variables correctly', () => {
    render(
      <ThemeProvider>
        <TestComp />
      </ThemeProvider>,
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-background')).toBe(themes.dark.colors.background);
    expect(root.style.getPropertyValue('--color-foreground')).toBe(themes.dark.colors.foreground);
    
    fireEvent.click(screen.getByRole('button'));
    expect(root.style.getPropertyValue('--color-background')).toBe(themes.light.colors.background);
    expect(root.style.getPropertyValue('--color-foreground')).toBe(themes.light.colors.foreground);
  });

  it('supports multiple themes', () => {
    render(
      <ThemeProvider>
        <TestComp />
      </ThemeProvider>,
    );
    const select = screen.getByRole('combobox');
    
    // Check that all themes are available
    expect(screen.getByText('light')).toBeInTheDocument();
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(screen.getByText('sepia')).toBeInTheDocument();
    
    // Switch to sepia theme
    fireEvent.change(select, { target: { value: 'sepia' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('sepia');
    expect(document.documentElement.style.getPropertyValue('--color-background')).toBe(
      themes.sepia.colors.background
    );
  });
});
