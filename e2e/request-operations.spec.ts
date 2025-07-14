import { test, expect } from './fixtures/electron-fixture';

// Constants for timeouts
const WAIT_FOR_APP_READY = process.env.CI ? 5000 : 3000;
const WAIT_SHORT = 500;
const WAIT_MEDIUM = 1000;
// const WAIT_LONG = 3000; // Uncomment if needed
const WAIT_FOR_RESPONSE = 5000;

// Helper function to wait for response with retry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function waitForResponse(window: any, timeout = WAIT_FOR_RESPONSE) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const responseArea = await window.locator('pre, [class*="response"], .json-response').first();
      if (await responseArea.isVisible()) {
        const text = await responseArea.textContent();
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch {
      // Continue waiting
    }
    await window.waitForTimeout(WAIT_SHORT);
  }

  return null;
}

test.describe('Request Operations', () => {
  test('should create and send a GET request', async ({ window }) => {
    // Wait a bit more for app to stabilize
    await window.waitForTimeout(WAIT_MEDIUM);
    await window.screenshot({ path: 'e2e-results/screenshots/request-operations-01-initial.png' });

    // Find and fill URL input
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.click();
    await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-02-url-filled.png',
    });

    // Click Send button
    const sendButton = await window
      .locator('button:has-text("Send"), button:has-text("送信")')
      .first();
    await sendButton.click();
    await window.screenshot({ path: 'e2e-results/screenshots/request-operations-03-sending.png' });

    // Wait for response
    const responseText = await waitForResponse(window);
    expect(responseText).toBeTruthy();
    expect(responseText).toContain('userId');
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-04-response-received.png',
    });
  });

  test('should create and send a POST request with body', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(WAIT_FOR_APP_READY);
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-05-post-initial.png',
    });

    // Fill URL
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.click();
    await urlInput.fill('https://jsonplaceholder.typicode.com/posts');

    // Select POST method - find the HTTP method selector
    const methodSelector = await window.locator('select:has(option[value="GET"])').first();

    try {
      await methodSelector.selectOption('POST');
    } catch {
      // If select fails, try to wait and retry once
      await window.waitForTimeout(WAIT_SHORT);
      await methodSelector.selectOption('POST');
    }

    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-06-post-selected.png',
    });

    // Navigate to Body tab
    const bodyTab = await window
      .locator('button:has-text("Body"), button:has-text("ボディ")')
      .first();
    await bodyTab.click();

    // Wait for body editor to be visible
    await window.waitForTimeout(WAIT_MEDIUM);
    await window.screenshot({ path: 'e2e-results/screenshots/request-operations-07-body-tab.png' });

    // Add a body row first by clicking the "Add Body Row" button
    const addBodyButton = await window
      .locator('button:has-text("ボディ行を追加"), button:has-text("Add Body")')
      .first();
    await addBodyButton.click();
    await window.waitForTimeout(WAIT_SHORT);

    // Now look for the Value input field (for JSON content)
    const bodyEditor = await window
      .locator(
        'input[placeholder*="JSON"], input[placeholder*="Value"], input[placeholder*="string"]',
      )
      .first();

    // Verify the editor is visible
    await bodyEditor.waitFor({ state: 'visible', timeout: 5000 });

    await bodyEditor.click();
    await window.waitForTimeout(200); // Wait for focus

    const bodyContent = JSON.stringify(
      {
        title: 'Test Post',
        body: 'This is a test post from E2E test',
        userId: 1,
      },
      null,
      2,
    );

    // Clear any existing content first
    await bodyEditor.fill('');
    await bodyEditor.fill(bodyContent);
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-08-body-filled.png',
    });

    // Send request
    const sendButton = await window
      .locator('button:has-text("Send"), button:has-text("送信")')
      .first();
    await sendButton.click();

    // Wait for response
    const responseText = await waitForResponse(window, WAIT_FOR_RESPONSE * 2); // Give more time for POST

    // The API returns a new ID, which means the POST was successful
    // We expect either our content or at minimum a successful response with an ID
    expect(responseText).toBeTruthy();
    expect(responseText).toMatch(/id.*\d+|Test Post|title/);
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-09-post-response.png',
    });
  });
});
