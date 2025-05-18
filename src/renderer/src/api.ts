const { ipcRenderer } = window.require('electron');
import type { ApiResult } from './types';

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
  return await ipcRenderer.invoke('send-api-request', { method, url, data, headers });
}
