import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendApiRequest: (options) => ipcRenderer.invoke('send-api-request', options),
});
