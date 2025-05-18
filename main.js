import { app, BrowserWindow, ipcMain } from 'electron';
import axios from 'axios'
import path from 'node:path';

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
    win.webContents.openDevTools(); // Open DevTools in development mode
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// Generic API request handler
ipcMain.handle('send-api-request', async (_event, { method, url, data, headers }) => {
  try {
    const response = await axios({
      method: method,
      url: url,
      data: data,
      headers: headers,
      validateStatus: () => true, // Acept all status codes, so we can see errors in the UI
    });
    return { status: response.status, headers: response.headers, data: response.data };
  } catch (error) {
    // Ensure errors are serializable for IPC
    if (axios.isAxiosError(error)) {
      return {
        isError: true,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
    return {
      isError: true,
      message: error.message || 'An unknown error occurred',
    };
  }
});

app.whenReady().then(createWindow);
