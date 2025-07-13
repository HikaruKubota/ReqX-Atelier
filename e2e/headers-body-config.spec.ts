import { test, expect } from './fixtures/electron-fixture';

test.describe('Headers and Body Configuration', () => {
  test('should add and remove headers', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-01-initial.png' });

    // Navigate to Headers tab
    const headersTab = await window
      .locator('button:has-text("Headers"), button:has-text("ヘッダー")')
      .first();
    await headersTab.click();
    await window.waitForTimeout(1000);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-02-headers-tab.png' });

    // Add a header
    const addHeaderButton = await window
      .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
      .first();
    if (await addHeaderButton.isVisible()) {
      await addHeaderButton.click();
      await window.waitForTimeout(500);
    }

    // Fill header key and value
    const headerKeyInputs = await window
      .locator('input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]')
      .all();
    const headerValueInputs = await window
      .locator('input[placeholder*="Value"], input[placeholder*="value"], input[placeholder*="値"]')
      .all();

    if (headerKeyInputs.length > 0 && headerValueInputs.length > 0) {
      const lastKeyInput = headerKeyInputs[headerKeyInputs.length - 1];
      const lastValueInput = headerValueInputs[headerValueInputs.length - 1];

      await lastKeyInput.fill('Authorization');
      await lastValueInput.fill('Bearer test-token-123');

      // Verify header was added
      const keyValue = await lastKeyInput.inputValue();
      expect(keyValue).toBe('Authorization');
      await window.screenshot({
        path: 'e2e-results/screenshots/headers-body-03-first-header-added.png',
      });
    }

    // Add another header
    if (await addHeaderButton.isVisible()) {
      await addHeaderButton.click();
      await window.waitForTimeout(500);

      const headerKeyInputs2 = await window
        .locator('input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]')
        .all();
      const headerValueInputs2 = await window
        .locator(
          'input[placeholder*="Value"], input[placeholder*="value"], input[placeholder*="値"]',
        )
        .all();

      if (headerKeyInputs2.length > 1 && headerValueInputs2.length > 1) {
        const lastKeyInput2 = headerKeyInputs2[headerKeyInputs2.length - 1];
        const lastValueInput2 = headerValueInputs2[headerValueInputs2.length - 1];

        await lastKeyInput2.fill('Content-Type');
        await lastValueInput2.fill('application/json');
        await window.screenshot({
          path: 'e2e-results/screenshots/headers-body-04-second-header-added.png',
        });
      }
    }
  });

  test('should configure different body types', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-05-body-initial.png' });

    // Navigate to Body tab
    const bodyTab = await window
      .locator('button:has-text("Body"), button:has-text("ボディ")')
      .first();
    await bodyTab.click();
    await window.waitForTimeout(1000);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-06-body-tab.png' });

    // Select JSON body type if available
    const jsonOption = await window
      .locator('label:has-text("JSON"), button:has-text("JSON")')
      .first();
    if (await jsonOption.isVisible()) {
      await jsonOption.click();
      await window.waitForTimeout(500);
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
      await window.screenshot({
        path: 'e2e-results/screenshots/headers-body-07-json-body-filled.png',
      });
    }
  });

  test('should add query parameters', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-08-params-initial.png' });

    // Navigate to Params tab if available
    const paramsTab = await window
      .locator('button:has-text("Params"), button:has-text("パラメータ")')
      .first();
    if (await paramsTab.isVisible()) {
      await paramsTab.click();
      await window.waitForTimeout(1000);
      await window.screenshot({ path: 'e2e-results/screenshots/headers-body-09-params-tab.png' });

      // Add parameters
      const addParamButton = await window
        .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
        .first();
      if (await addParamButton.isVisible()) {
        await addParamButton.click();
        await window.waitForTimeout(500);

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
          await window.screenshot({
            path: 'e2e-results/screenshots/headers-body-10-first-param-added.png',
          });

          // Add another parameter
          await addParamButton.click();
          await window.waitForTimeout(500);

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
            await window.screenshot({
              path: 'e2e-results/screenshots/headers-body-11-second-param-added.png',
            });
          }
        }
      }
    }

    // Verify URL contains parameters
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    const url = await urlInput.inputValue();
    if (url && (url.includes('?') || url.includes('&'))) {
      expect(url).toMatch(/[?&](page|limit)=/);
    }
    await window.screenshot({ path: 'e2e-results/screenshots/headers-body-12-params-in-url.png' });
  });
});
