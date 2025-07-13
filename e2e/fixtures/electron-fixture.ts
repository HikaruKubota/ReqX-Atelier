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
        // Prevent DevTools from opening during E2E tests
        E2E_TEST: 'true',
      },
    });

    await use(electronApp);

    await electronApp.close();
  },

  window: async ({ electronApp }, use) => {
    // Wait for the main window (not DevTools)
    const window = await electronApp.firstWindow();

    // Wait for window to be ready
    await window.waitForLoadState('domcontentloaded'); // cspell:disable-line

    // Wait for the React app to mount by looking for the "New Request" button
    // The app starts with no tabs open, so we need to wait for the New Request button
    await window.waitForSelector(
      'button:has-text("新しいリクエスト"), button:has-text("New Request"), button[title*="New"]',
      {
        timeout: 15000,
      },
    );

    // Click the New Request button to open a tab with the URL input
    const newRequestButton = await window
      .locator(
        'button:has-text("新しいリクエスト"), button:has-text("New Request"), button[title*="New"]',
      )
      .first();
    await newRequestButton.click();

    // Now wait for the URL input to appear
    await window.waitForSelector('input[placeholder*="URL"], input[placeholder*="url"]', {
      timeout: 5000,
    });

    // Additional wait to ensure everything is rendered
    await window.waitForTimeout(1000);

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
