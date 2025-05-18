const { ipcRenderer } = window.require('electron');

export interface ApiResult {
  isError?: boolean; // Optional, as successful responses might not have this
  status?: number;
  data?: unknown;
  headers?: Record<string, unknown>;
  message?: string; // For errors
  responseData?: unknown; // This was used in App.tsx error handling, merging with data or keeping separate
}

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
    } catch (e) {
      // JSONパースエラーの場合は、そのまま文字列として送信するか、エラーを返すか選択できます。
      // ここではエラーを投げてUI側で処理させます。
      throw new Error('Invalid JSON body');
    }
  }
  return await ipcRenderer.invoke('send-api-request', { method, url, data, headers });
}
