import type { ApiResult } from './types';
const { electronAPI } = window;

export async function sendApiRequest(
  method: string,
  url: string,
  body?: string,
  headers?: Record<string, string>,
): Promise<ApiResult> {
  let data = null;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      // JSONパースエラーの場合は、そのまま文字列として送信するか、エラーを返すか選択できます。
      // ここではエラーを投げてUI側で処理させます。
      throw new Error('Invalid JSON body');
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[sendApiRequest]', { method, url, data, headers });
  }
  return await electronAPI.sendApiRequest({ method, url, data, headers });
}
