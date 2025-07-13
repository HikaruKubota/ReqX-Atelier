import { test, expect } from './fixtures/electron-fixture';

test.describe('Request Operations', () => {
  test('should create and send a GET request', async ({ window }) => {
    // Wait a bit more for app to stabilize
    await window.waitForTimeout(1000);
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
    await window.waitForTimeout(3000);

    // Check if response is displayed
    const responseArea = await window.locator('pre, [class*="response"]').first();
    const responseText = await responseArea.textContent();
    expect(responseText).toBeTruthy();
    expect(responseText).toContain('userId');
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-04-response-received.png',
    });
  });

  test('should create and send a POST request with body', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-05-post-initial.png',
    });

    // Fill URL
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.click();
    await urlInput.fill('https://jsonplaceholder.typicode.com/posts');

    // Select POST method - find the HTTP method selector specifically
    // It should be near the URL input field, not in the header area
    const requestEditorArea = await window
      .locator('.request-editor, [class*="editor"], .p-4')
      .first();
    const methodSelector = await requestEditorArea.locator('select').first();

    // Wait for the select to be fully loaded
    await window.waitForTimeout(500);

    // Debug: log available options
    try {
      const options = await methodSelector.locator('option').allTextContents();
      console.log('Available method options:', options);

      // Verify this is the correct selector by checking if it has HTTP methods
      if (options.includes('GET') || options.includes('POST')) {
        await methodSelector.selectOption('POST');
      } else {
        // Fallback: look for select element that contains GET option
        const httpMethodSelector = await window.locator('select:has(option[value="GET"])').first();
        await httpMethodSelector.selectOption('POST');
      }
    } catch {
      // Final fallback: try to find by visual proximity to URL input
      const urlInput = await window.locator('input[placeholder*="URL"]').first();
      const nearbySelect = await urlInput
        .locator('xpath=../select | xpath=../../select | xpath=../../../select')
        .first();
      await nearbySelect.selectOption('POST');
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
    await window.waitForTimeout(1000);
    await window.screenshot({ path: 'e2e-results/screenshots/request-operations-07-body-tab.png' });

    // Add a body row first by clicking the "Add Body Row" button
    const addBodyButton = await window
      .locator('button:has-text("ボディ行を追加"), button:has-text("Add Body")')
      .first();
    await addBodyButton.click();
    await window.waitForTimeout(500);

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
    await window.waitForTimeout(5000); // Give more time for POST request

    // Verify response - try multiple selectors for response area
    let responseText = '';
    try {
      const responseArea = await window.locator('pre, [class*="response"], .json-response').first();
      await responseArea.waitFor({ timeout: 10000 });
      responseText = (await responseArea.textContent()) || '';
    } catch {
      // If structured response not found, try to find any response content
      const anyResponse = await window.locator('text=Test Post, text="title"').first();
      if (await anyResponse.isVisible()) {
        responseText = 'Test Post'; // Simplified check
      }
    }

    // The API returns a new ID, which means the POST was successful
    // We expect either our content or at minimum a successful response with an ID
    expect(responseText.length > 0).toBe(true);
    expect(responseText).toMatch(/id.*\d+|Test Post/);
    await window.screenshot({
      path: 'e2e-results/screenshots/request-operations-09-post-response.png',
    });
  });
});
