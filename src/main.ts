import { app, BrowserWindow, ipcMain } from 'electron';
import axios from 'axios';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC handlers for API requests
ipcMain.handle('fetch-todos', async () => {
  const res = await axios.get('http://localhost:3000/todos');
  return res.data;
});
ipcMain.handle('fetch-health', async () => {
  const res = await axios.get('http://localhost:3000/health');
  return res.data;
});

app.whenReady().then(createWindow);
