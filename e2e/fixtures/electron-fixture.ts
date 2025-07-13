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
    const electronApp = await electron.launch({
      args: [
        mainPath,
        // Disable GPU acceleration in CI to avoid rendering issues
        ...(process.env.CI ? ['--disable-gpu', '--disable-software-rasterizer'] : []),
      ],
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    await use(electronApp);

    await electronApp.close();
  },

  window: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();

    // Wait for window to be ready
    await window.waitForLoadState('domcontentloaded'); // cspell:disable-line

    // Additional wait to ensure window is fully rendered
    await window.waitForTimeout(2000);

    // Ensure window has proper dimensions
    const viewportSize = window.viewportSize();
    if (!viewportSize || viewportSize.width === 0 || viewportSize.height === 0) {
      // Set a default viewport size if not set
      await window.setViewportSize({ width: 1280, height: 720 });
    }

    await use(window);
  },
});

export { expect } from '@playwright/test';
