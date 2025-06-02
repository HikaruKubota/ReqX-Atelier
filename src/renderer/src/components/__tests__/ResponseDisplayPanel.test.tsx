import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../../theme/ThemeProvider';
import { ResponseDisplayPanel } from '../ResponseDisplayPanel';
import '../../i18n';

const sampleResponse = { data: { ok: true }, headers: { foo: 'bar' } };
const sampleError = { message: 'bad' };

const Wrapper: React.FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <button onClick={() => setTheme(theme.name === 'light' ? 'dark' : 'light')}>toggle</button>
      <ResponseDisplayPanel
        response={sampleResponse}
        error={null}
        loading={false}
        responseTime={123}
      />
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
    expect(pre.className).toMatch('bg-green-100');
    expect(screen.getByText('レスポンス時間: 123ms')).toBeInTheDocument();
    fireEvent.click(screen.getByText('toggle'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('shows copy button and fires clipboard copy', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <ThemeProvider>
        <ResponseDisplayPanel
          response={sampleResponse}
          error={null}
          loading={false}
          responseTime={123}
        />
      </ThemeProvider>,
    );

    const btn = screen.getByRole('button', { name: 'レスポンスをコピー' });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(sampleResponse.data, null, 2),
    );
    expect(await screen.findByText('コピーしました！')).toBeInTheDocument();
  });

  it('copies error when error present', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <ThemeProvider>
        <ResponseDisplayPanel
          response={null}
          error={sampleError}
          loading={false}
          responseTime={123}
        />
      </ThemeProvider>,
    );

    const btn = screen.getByRole('button', { name: 'エラーをコピー' });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(sampleError, null, 2),
    );
    expect(await screen.findByText('コピーしました！')).toBeInTheDocument();
  });

  it('shows headers when tab selected', () => {
    render(
      <ThemeProvider>
        <ResponseDisplayPanel
          response={sampleResponse}
          error={null}
          loading={false}
          responseTime={123}
        />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'ヘッダー' }));
    expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ヘッダーをコピー' })).toBeInTheDocument();
  });
});
