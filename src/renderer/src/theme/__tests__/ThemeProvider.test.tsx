import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';

const TestComp = () => {
  const { mode, toggleMode } = useTheme();
  return <button onClick={toggleMode}>現在:{mode}</button>;
};

describe('ThemeProvider', () => {
  it('toggles mode', () => {
    render(
      <ThemeProvider>
        <TestComp />
      </ThemeProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('現在:light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    fireEvent.click(btn);
    expect(btn.textContent).toBe('現在:dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
