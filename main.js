const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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

// IPC handlers for API requests
ipcMain.handle('fetch-todos', async () => {
  const res = await axios.get('http://localhost:3000/todos');
  return res.data;
});
ipcMain.handle('fetch-health', async () => {
  const res = await axios.get('http://localhost:3000/health');
  return res.data;
});

// Generic API request handler
ipcMain.handle('send-api-request', async (_event, { method, url, data }) => {
  try {
    const response = await axios({
      method: method,
      url: url,
      data: data,
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
