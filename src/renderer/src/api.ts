// @ts-ignore
const { ipcRenderer } = window.require('electron');

export async function health() {
  return await ipcRenderer.invoke('fetch-health');
}

export async function todos() { // この関数はApp.tsxではもう使われていませんが、サンプルとして残します
  return await ipcRenderer.invoke('fetch-todos');
}

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
