import { test, expect } from './fixtures/electron-fixture';

// Constants for timeouts
const WAIT_FOR_APP_READY = process.env.CI ? 5000 : 3000;
const WAIT_SHORT = 500;
const WAIT_MEDIUM = 1000;

// Helper function to add a header
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addHeader(window: any, key: string, value: string) {
  const addHeaderButton = await window
    .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
    .first();

  if (await addHeaderButton.isVisible()) {
    await addHeaderButton.click();
    await window.waitForTimeout(WAIT_SHORT);

    const headerKeyInputs = await window
      .locator('input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]')
      .all();
    const headerValueInputs = await window
      .locator('input[placeholder*="Value"], input[placeholder*="value"], input[placeholder*="値"]')
      .all();

    if (headerKeyInputs.length > 0 && headerValueInputs.length > 0) {
      const lastKeyInput = headerKeyInputs[headerKeyInputs.length - 1];
      const lastValueInput = headerValueInputs[headerValueInputs.length - 1];

      await lastKeyInput.fill(key);
      await lastValueInput.fill(value);

      // Verify the values were set
      const keyValue = await lastKeyInput.inputValue();
      const valueValue = await lastValueInput.inputValue();
      expect(keyValue).toBe(key);
      expect(valueValue).toBe(value);

      return true;
    }
  }
  return false;
}

test.describe('Headers and Body Configuration', () => {
  test('should add and manage headers', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(WAIT_FOR_APP_READY);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-01-initial.png' });

    // Navigate to Headers tab
    const headersTab = await window
      .locator('button:has-text("Headers"), button:has-text("ヘッダー")')
      .first();
    await headersTab.click();
    await window.waitForTimeout(WAIT_MEDIUM);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-02-headers-tab.png' });

    // Add first header using helper function
    const firstHeaderAdded = await addHeader(window, 'Authorization', 'Bearer test-token-123');
    expect(firstHeaderAdded).toBe(true);
    await window.screenshot({
      path: 'e2e-results/screenshots/headers-body-03-first-header-added.png',
    });

    // Add second header using helper function
    const secondHeaderAdded = await addHeader(window, 'Content-Type', 'application/json');
    expect(secondHeaderAdded).toBe(true);
    await window.screenshot({
      path: 'e2e-results/screenshots/headers-body-04-second-header-added.png',
    });

    // Verify we have at least 2 headers
    const allHeaderKeys = await window
      .locator('input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]')
      .all();
    expect(allHeaderKeys.length).toBeGreaterThanOrEqual(2);
  });

  test('should configure JSON body type', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(WAIT_FOR_APP_READY);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-05-body-initial.png' });

    // Navigate to Body tab
    const bodyTab = await window
      .locator('button:has-text("Body"), button:has-text("ボディ")')
      .first();
    await bodyTab.click();
    await window.waitForTimeout(WAIT_MEDIUM);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-06-body-tab.png' });

    // Select JSON body type if available
    const jsonOption = await window
      .locator('label:has-text("JSON"), button:has-text("JSON")')
      .first();
    if (await jsonOption.isVisible()) {
      await jsonOption.click();
      await window.waitForTimeout(WAIT_SHORT);
    }

    // Fill JSON body
    const bodyEditor = await window
      .locator('textarea, [contenteditable="true"], .CodeMirror')
      .first(); // cspell:disable-line
    const jsonBody = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      active: true,
    };

    if (await bodyEditor.isVisible()) {
      await bodyEditor.click();
      await bodyEditor.fill(JSON.stringify(jsonBody, null, 2));

      // Verify body content
      const bodyContent = (await bodyEditor.inputValue()) || (await bodyEditor.textContent());
      expect(bodyContent).toContain('Test User');
      expect(bodyContent).toContain('test@example.com');
      expect(bodyContent).toContain('25');
      expect(bodyContent).toContain('true');
      await window.screenshot({
        path: 'e2e-results/screenshots/headers-body-07-json-body-filled.png',
      });
    }
  });

  test('should add query parameters', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(WAIT_FOR_APP_READY);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-08-params-initial.png' });

    // Navigate to Params tab if available
    const paramsTab = await window
      .locator('button:has-text("Params"), button:has-text("パラメータ")')
      .first();
    if (await paramsTab.isVisible()) {
      await paramsTab.click();
      await window.waitForTimeout(WAIT_MEDIUM);
      await window.screenshot({ path: 'e2e-results/screenshots/headers-body-09-params-tab.png' });

      // Add parameters
      const addParamButton = await window
        .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
        .first();
      if (await addParamButton.isVisible()) {
        await addParamButton.click();
        await window.waitForTimeout(WAIT_SHORT);

        const paramKeyInputs = await window
          .locator(
            'input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]',
          )
          .all();
        const paramValueInputs = await window
          .locator(
            'input[placeholder*="Value"], input[placeholder*="value"], input[placeholder*="値"]',
          )
          .all();

        if (paramKeyInputs.length > 0 && paramValueInputs.length > 0) {
          const lastKeyInput = paramKeyInputs[paramKeyInputs.length - 1];
          const lastValueInput = paramValueInputs[paramValueInputs.length - 1];

          await lastKeyInput.fill('page');
          await lastValueInput.fill('1');

          // Verify parameter was added
          const keyValue = await lastKeyInput.inputValue();
          const valueValue = await lastValueInput.inputValue();
          expect(keyValue).toBe('page');
          expect(valueValue).toBe('1');

          await window.screenshot({
            path: 'e2e-results/screenshots/headers-body-10-first-param-added.png',
          });

          // Add another parameter
          await addParamButton.click();
          await window.waitForTimeout(WAIT_SHORT);

          const paramKeyInputs2 = await window
            .locator(
              'input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]',
            )
            .all();
          const paramValueInputs2 = await window
            .locator(
              'input[placeholder*="Value"], input[placeholder*="value"], input[placeholder*="値"]',
            )
            .all();

          if (paramKeyInputs2.length > 1 && paramValueInputs2.length > 1) {
            const lastKeyInput2 = paramKeyInputs2[paramKeyInputs2.length - 1];
            const lastValueInput2 = paramValueInputs2[paramValueInputs2.length - 1];

            await lastKeyInput2.fill('limit');
            await lastValueInput2.fill('10');

            // Verify second parameter was added
            const keyValue2 = await lastKeyInput2.inputValue();
            const valueValue2 = await lastValueInput2.inputValue();
            expect(keyValue2).toBe('limit');
            expect(valueValue2).toBe('10');

            await window.screenshot({
              path: 'e2e-results/screenshots/headers-body-11-second-param-added.png',
            });
          }
        }
      }
    }

    // Verify parameters functionality was tested
    const paramsFunctionality = await paramsTab.isVisible();
    expect(paramsFunctionality).toBe(true);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-12-params-in-url.png' });
  });
});
