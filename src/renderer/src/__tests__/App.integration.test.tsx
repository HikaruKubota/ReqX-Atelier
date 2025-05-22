import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  sendApiRequest: vi.fn().mockResolvedValue({ status: 200, data: { message: 'ok' } }),
}));

import App from '../App';
import { ThemeProvider } from '../theme/ThemeProvider';
import '../i18n';

beforeEach(() => {
  localStorage.clear();
});

describe('App integration', () => {
  it('新規保存したリクエストがサイドバーに表示される', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);

    fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
      target: { value: 'テストリクエスト' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://example.com' } },
    );
    fireEvent.click(screen.getByText('リクエストを保存'));

    const sidebar = screen.getByTestId('sidebar');
    expect(await within(sidebar).findByText('テストリクエスト')).toBeInTheDocument();
  });

  it('ショートカットで保存したリクエストがサイドバーに表示される', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);

    fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
      target: { value: 'ショートカット保存' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://example.org' } },
    );
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });

    const sidebar = screen.getByTestId('sidebar');
    expect(await within(sidebar).findByText('ショートカット保存')).toBeInTheDocument();
  });

  it('SendボタンでAPIレスポンスが表示される', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);

    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://api.example.com' } },
    );
    fireEvent.click(screen.getByText('送信'));

    expect(await screen.findByText(/ok/)).toBeInTheDocument();
  });
});
