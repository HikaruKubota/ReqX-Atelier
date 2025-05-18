import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    fireEvent.change(screen.getByPlaceholderText('Request Name (e.g., Get User Details)'), {
      target: { value: 'テストリクエスト' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Enter request URL (e.g., https://api.example.com/users)'),
      { target: { value: 'https://example.com' } },
    );
    fireEvent.click(screen.getByText('Save Request'));

    expect(await screen.findByText('テストリクエスト')).toBeInTheDocument();
  });

  it('SendボタンでAPIレスポンスが表示される', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);

    fireEvent.change(
      screen.getByPlaceholderText('Enter request URL (e.g., https://api.example.com/users)'),
      { target: { value: 'https://api.example.com' } },
    );
    fireEvent.click(screen.getByText('Send'));

    expect(await screen.findByText(/ok/)).toBeInTheDocument();
  });
});
