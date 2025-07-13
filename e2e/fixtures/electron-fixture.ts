import { test as base, _electron as electron } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const test = base.extend<{
  electronApp: Awaited<ReturnType<typeof electron.launch>>;
  window: Awaited<ReturnType<Awaited<ReturnType<typeof electron.launch>>['firstWindow']>>;
}>({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, use) => {
    const mainPath = path.join(__dirname, '../../main.js');

    // Comprehensive Electron launch arguments for headless environments
    const args = [mainPath];

    // Add arguments for CI/headless environments
    if (process.env.CI || process.platform === 'linux') {
      args.push(
        // Essential for running in containers and CI environments
        '--no-sandbox',
        '--disable-setuid-sandbox',

        // Disable GPU and related features
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',

        // Force software rendering
        '--use-gl=swiftshader',

        // Disable features that might cause issues in headless environments
        '--disable-accelerated-2d-canvas',
        '--disable-gpu-sandbox',

        // Additional stability flags
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-breakpad',

        // Force headless mode on Linux CI
        ...(process.env.CI && process.platform === 'linux' ? ['--headless'] : []),
      );
    }

    // Log launch configuration for debugging
    console.log('Launching Electron with args:', args);
    console.log('Platform:', process.platform);
    console.log('CI environment:', !!process.env.CI);

    let electronApp;
    try {
      electronApp = await electron.launch({
        args,
        env: {
          ...process.env,
          NODE_ENV: 'development',
          // Force software rendering
          ELECTRON_DISABLE_GPU: '1',
          // Disable sandbox for CI
          ELECTRON_DISABLE_SANDBOX: process.env.CI ? '1' : '0',
        },
        // Increase timeout for slower CI environments
        timeout: process.env.CI ? 60000 : 30000,
      });
    } catch (error) {
      console.error('Failed to launch Electron:', error);
      console.error('Make sure the following packages are installed on Ubuntu:');
      console.error('  - xvfb');
      console.error('  - libnss3');
      console.error('  - libatk-bridge2.0-0');
      console.error('  - libgtk-3-0');
      console.error('  - libgbm1');
      console.error(
        'Run: sudo apt-get install -y xvfb libnss3 libatk-bridge2.0-0 libgtk-3-0 libgbm1', // cspell:disable-line
      );
      throw error;
    }

    await use(electronApp);

    await electronApp.close();
  },

  window: async ({ electronApp }, use) => {
    let window: Awaited<ReturnType<typeof electronApp.firstWindow>>;

    try {
      // Wait for the first window with increased timeout in CI
      window = await electronApp.firstWindow({
        timeout: process.env.CI ? 30000 : 10000,
      });
    } catch (error) {
      console.error('Failed to get first window:', error);
      // Try to get any window if firstWindow fails
      const windows = electronApp.windows();
      if (windows.length > 0) {
        window = windows[0];
      } else {
        throw new Error('No windows found in Electron app');
      }
    }

    // Wait for window to be ready
    try {
      await window.waitForLoadState('domcontentloaded', {
        // cspell:disable-line
        timeout: process.env.CI ? 30000 : 10000,
      });
    } catch (error) {
      console.warn('Timeout waiting for domcontentloaded, continuing anyway:', error); // cspell:disable-line
    }

    // Additional wait to ensure window is fully rendered
    await window.waitForTimeout(2000);

    // Ensure window has proper dimensions
    try {
      const viewportSize = window.viewportSize();
      if (!viewportSize || viewportSize.width === 0 || viewportSize.height === 0) {
        // Set a default viewport size if not set
        await window.setViewportSize({ width: 1280, height: 720 });
      }
    } catch (error) {
      console.warn('Could not set viewport size:', error);
      // Continue anyway as this might not be critical in headless mode
    }

    await use(window);
  },
});

export { expect } from '@playwright/test';
