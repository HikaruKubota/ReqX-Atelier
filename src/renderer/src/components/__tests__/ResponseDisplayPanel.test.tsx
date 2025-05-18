import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from '../../theme/ThemeProvider';
import { ResponseDisplayPanel } from '../ResponseDisplayPanel';
import '../../i18n';

const sampleResponse = { ok: true };

const Wrapper: React.FC = () => {
  const { toggleMode } = useTheme();
  return (
    <>
      <button onClick={toggleMode}>toggle</button>
      <ResponseDisplayPanel response={sampleResponse} error={null} loading={false} />
    </>
  );
};

describe('ResponseDisplayPanel', () => {
  it('shows response text and dark mode classes', () => {
    render(
      <ThemeProvider>
        <Wrapper />
      </ThemeProvider>,
    );
    const pre = screen.getByText(/"ok": true/);
    expect(pre.className).toMatch('dark:bg-green-900');
    fireEvent.click(screen.getByText('toggle'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
