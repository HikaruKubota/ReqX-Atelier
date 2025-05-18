import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { lightColors, darkColors } from '../colors';
import { useThemeStore } from '../../store/themeStore';

const TestComp = () => {
  const { mode, toggleMode } = useTheme();
  return <button onClick={toggleMode}>現在:{mode}</button>;
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ mode: 'dark' });
  });

  it('toggles mode', () => {
    render(
      <ThemeProvider>
        <TestComp />
      </ThemeProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('現在:dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(btn);
    expect(btn.textContent).toBe('現在:light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies color variables correctly', () => {
    render(
      <ThemeProvider>
        <TestComp />
      </ThemeProvider>,
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-background')).toBe(darkColors.background);
    expect(root.style.getPropertyValue('--color-text')).toBe(darkColors.text);
    fireEvent.click(screen.getByRole('button'));
    expect(root.style.getPropertyValue('--color-background')).toBe(lightColors.background);
    expect(root.style.getPropertyValue('--color-text')).toBe(lightColors.text);
  });
});
