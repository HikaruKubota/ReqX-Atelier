import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
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

describe('Tab switching with sidebar requests', () => {
  it('should update tab editor state when switching to an existing tab via sidebar', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // Create first request
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);
    fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
      target: { value: 'Request 1' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://api1.example.com' } },
    );
    fireEvent.click(screen.getByText('リクエストを保存'));

    // Wait for the request to be saved and appear in sidebar
    const sidebar = screen.getByTestId('sidebar');
    await waitFor(() => {
      expect(within(sidebar).getByText('Request 1')).toBeInTheDocument();
    });

    // Create second request in a new tab
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);
    fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
      target: { value: 'Request 2' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://api2.example.com' } },
    );
    fireEvent.click(screen.getByText('リクエストを保存'));

    // Wait for the second request to be saved
    await waitFor(() => {
      expect(within(sidebar).getByText('Request 2')).toBeInTheDocument();
    });

    // Now we have two tabs open. Click on the first request from sidebar
    fireEvent.click(within(sidebar).getByText('Request 1'));

    // Verify that the URL input shows the correct URL for Request 1
    await waitFor(() => {
      const urlInput = screen.getByPlaceholderText(
        'リクエストURLを入力 (例: https://api.example.com/users)',
      ) as HTMLInputElement;
      expect(urlInput.value).toBe('https://api1.example.com');
    });

    // Click on the second request from sidebar
    fireEvent.click(within(sidebar).getByText('Request 2'));

    // Verify that the URL input shows the correct URL for Request 2
    await waitFor(() => {
      const urlInput = screen.getByPlaceholderText(
        'リクエストURLを入力 (例: https://api.example.com/users)',
      ) as HTMLInputElement;
      expect(urlInput.value).toBe('https://api2.example.com');
    });
  });

  it('should maintain correct state when rapidly switching between tabs', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // Create three requests
    const requests = [
      { name: 'GET Users', url: 'https://api.example.com/users', method: 'GET' },
      { name: 'POST User', url: 'https://api.example.com/users', method: 'POST' },
      { name: 'DELETE User', url: 'https://api.example.com/users/123', method: 'DELETE' },
    ];

    for (const request of requests) {
      fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);
      fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
        target: { value: request.name },
      });
      fireEvent.change(
        screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
        { target: { value: request.url } },
      );

      // Select method
      const methodSelect = screen.getByDisplayValue('GET');
      fireEvent.change(methodSelect, { target: { value: request.method } });

      fireEvent.click(screen.getByText('リクエストを保存'));

      // Wait for the request to be saved
      const sidebar = screen.getByTestId('sidebar');
      await waitFor(() => {
        expect(within(sidebar).getByText(request.name)).toBeInTheDocument();
      });
    }

    // Rapidly switch between tabs
    const sidebar = screen.getByTestId('sidebar');

    // Switch to first request
    fireEvent.click(within(sidebar).getByText('GET Users'));
    await waitFor(() => {
      const urlInput = screen.getByPlaceholderText(
        'リクエストURLを入力 (例: https://api.example.com/users)',
      ) as HTMLInputElement;
      expect(urlInput.value).toBe('https://api.example.com/users');
      expect(screen.getByDisplayValue('GET')).toBeInTheDocument();
    });

    // Switch to third request
    fireEvent.click(within(sidebar).getByText('DELETE User'));
    await waitFor(() => {
      const urlInput = screen.getByPlaceholderText(
        'リクエストURLを入力 (例: https://api.example.com/users)',
      ) as HTMLInputElement;
      expect(urlInput.value).toBe('https://api.example.com/users/123');
      expect(screen.getByDisplayValue('DELETE')).toBeInTheDocument();
    });

    // Switch to second request
    fireEvent.click(within(sidebar).getByText('POST User'));
    await waitFor(() => {
      const urlInput = screen.getByPlaceholderText(
        'リクエストURLを入力 (例: https://api.example.com/users)',
      ) as HTMLInputElement;
      expect(urlInput.value).toBe('https://api.example.com/users');
      expect(screen.getByDisplayValue('POST')).toBeInTheDocument();
    });
  });

  it('should preserve edited but unsaved changes when switching tabs', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // Create first request
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);
    fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
      target: { value: 'Original Request' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://original.example.com' } },
    );
    fireEvent.click(screen.getByText('リクエストを保存'));

    // Wait for save
    const sidebar = screen.getByTestId('sidebar');
    await waitFor(() => {
      expect(within(sidebar).getByText('Original Request')).toBeInTheDocument();
    });

    // Edit the URL without saving
    const urlInput = screen.getByPlaceholderText(
      'リクエストURLを入力 (例: https://api.example.com/users)',
    ) as HTMLInputElement;
    fireEvent.change(urlInput, { target: { value: 'https://edited.example.com' } });

    // Create another request in a new tab
    fireEvent.click(screen.getAllByLabelText('新しいリクエスト')[0]);
    fireEvent.change(screen.getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
      target: { value: 'Another Request' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('リクエストURLを入力 (例: https://api.example.com/users)'),
      { target: { value: 'https://another.example.com' } },
    );
    fireEvent.click(screen.getByText('リクエストを保存'));

    await waitFor(() => {
      expect(within(sidebar).getByText('Another Request')).toBeInTheDocument();
    });

    // Click on the first request from sidebar - this should reset to saved state
    fireEvent.click(within(sidebar).getByText('Original Request'));

    // Verify URL is reset to original saved value (not the edited value)
    await waitFor(() => {
      const urlInput = screen.getByPlaceholderText(
        'リクエストURLを入力 (例: https://api.example.com/users)',
      ) as HTMLInputElement;
      expect(urlInput.value).toBe('https://original.example.com');
    });
  });
});
