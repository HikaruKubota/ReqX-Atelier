import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../../theme/ThemeProvider';
import { ResponseDisplayPanel } from '../ResponseDisplayPanel';
import '../../i18n';

const sampleResponse = { ok: true };
const sampleError = { message: 'bad' };

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

  it('shows copy button and fires clipboard copy', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <ThemeProvider>
        <ResponseDisplayPanel response={sampleResponse} error={null} loading={false} />
      </ThemeProvider>,
    );

    const btn = screen.getByRole('button', { name: 'レスポンスをコピー' });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(sampleResponse, null, 2),
    );
    expect(await screen.findByText('コピーしました！')).toBeInTheDocument();
  });

  it('copies error when error present', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <ThemeProvider>
        <ResponseDisplayPanel response={null} error={sampleError} loading={false} />
      </ThemeProvider>,
    );

    const btn = screen.getByRole('button', { name: 'エラーをコピー' });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(sampleError, null, 2),
    );
    expect(await screen.findByText('コピーしました！')).toBeInTheDocument();
  });
});
