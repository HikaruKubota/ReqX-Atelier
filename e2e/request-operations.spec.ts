import { test, expect } from './fixtures/electron-fixture';

test.describe('Request Operations', () => {
  test('should create and send a GET request', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Find and fill URL input
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.click();
    await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');

    // Click Send button
    const sendButton = await window
      .locator('button:has-text("Send"), button:has-text("送信")')
      .first();
    await sendButton.click();

    // Wait for response
    await window.waitForTimeout(3000);

    // Check if response is displayed
    const responseArea = await window.locator('pre, [class*="response"]').first();
    const responseText = await responseArea.textContent();
    expect(responseText).toBeTruthy();
    expect(responseText).toContain('userId');
  });

  test('should create and send a POST request with body', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Fill URL
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.click();
    await urlInput.fill('https://jsonplaceholder.typicode.com/posts');

    // Select POST method
    const methodSelector = await window.locator('select').first();
    await methodSelector.selectOption('POST');

    // Navigate to Body tab
    const bodyTab = await window
      .locator('button:has-text("Body"), button:has-text("ボディ")')
      .first();
    await bodyTab.click();

    // Wait for body editor to be visible
    await window.waitForTimeout(1000);

    // Fill body content
    const bodyEditor = await window.locator('textarea, [contenteditable="true"]').first(); // cspell:disable-line
    await bodyEditor.click();
    await bodyEditor.fill(
      JSON.stringify(
        {
          title: 'Test Post',
          body: 'This is a test post from E2E test',
          userId: 1,
        },
        null,
        2,
      ),
    );

    // Send request
    const sendButton = await window
      .locator('button:has-text("Send"), button:has-text("送信")')
      .first();
    await sendButton.click();

    // Wait for response
    await window.waitForTimeout(3000);

    // Verify response
    const responseArea = await window.locator('pre, [class*="response"]').first();
    const responseText = await responseArea.textContent();
    expect(responseText).toContain('Test Post');
  });
});
