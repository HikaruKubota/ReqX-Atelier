import { app, BrowserWindow, ipcMain } from 'electron';
import axios from 'axios';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Don't open DevTools during E2E tests
    if (!process.env.E2E_TEST) {
      win.webContents.openDevTools(); // Open DevTools in development mode
    }
  } else {
    // In production, the HTML file is in the dist directory at the project root
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    win.loadFile(indexPath);
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
      validateStatus: () => true, // Accept all status codes, so we can see errors in the UI
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
