// @ts-ignore
const { ipcRenderer } = window.require('electron');

export async function health() {
  return await ipcRenderer.invoke('fetch-health');
}
