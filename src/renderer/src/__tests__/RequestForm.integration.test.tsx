/**
 * Integration test for RequestForm + MSW.
 *
 * シナリオ:
 * 1. URL フィールドに `/api/hello` を入力
 * 2. ⌘+Enter (Mac) / Ctrl+Enter (Win) で送信
 * 3. モック API が 200 OK を返し、レスポンスが画面に表示されることを確認
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/server';
import RequestForm from '../components/organisms/RequestForm';
import { describe, it, expect, beforeAll } from 'vitest';

describe('RequestForm integration', () => {
  const responseJson = { message: 'hello world' };

  beforeAll(() => {
    // MSW で /api/hello をスタブ
    server.use(
      http.all('/api/hello', () => HttpResponse.json(responseJson, { status: 200 })),
    );
  });

  it.skip('submits request and displays response', async () => {
    render(<RequestForm />);

    // 1) URL フィールドへ入力
    const urlInput = screen.getByPlaceholderText(/https?:\/\//i);
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, '/api/hello');

    // 2) ⌘+Enter 送信 (Meta or Ctrl)
    await userEvent.keyboard('{Meta>}{Enter}{/Meta}');

    // 3) レスポンス表示確認
    await waitFor(() =>
      expect(
        screen.getByText(JSON.stringify(responseJson, null, 2)),
      ).toBeInTheDocument(),
    );
  });
});
