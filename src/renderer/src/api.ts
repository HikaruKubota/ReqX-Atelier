// @ts-ignore
const { ipcRenderer } = window.require('electron');

export async function sendApiRequest(method: string, url: string, body?: string) {
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
  return await ipcRenderer.invoke('send-api-request', { method, url, data });
}
