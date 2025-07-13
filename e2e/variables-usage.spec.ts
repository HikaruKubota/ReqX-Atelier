import { test } from './fixtures/electron-fixture';

test.describe('Variables Usage', () => {
  test('should set and use global variables', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/variables-01-initial.png' });

    // Open variables panel
    const variablesButton = await window
      .locator('button:has-text("Variables"), button:has-text("変数"), button[title*="Variables"]')
      .first();
    await variablesButton.click();
    await window.waitForTimeout(1000);
    await window.screenshot({ path: 'e2e-results/screenshots/variables-02-panel-opened.png' });

    // Add a global variable
    const addVariableButton = await window
      .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
      .first();
    if (await addVariableButton.isVisible()) {
      await addVariableButton.click();
      await window.waitForTimeout(500);

      // Fill variable name and value
      const varNameInputs = await window
        .locator(
          'input[placeholder*="Name"], input[placeholder*="Variable"], input[placeholder*="名前"]',
        )
        .all();
      const varValueInputs = await window
        .locator('input[placeholder*="Value"], input[placeholder*="値"]')
        .all();

      if (varNameInputs.length > 0 && varValueInputs.length > 0) {
        const lastNameInput = varNameInputs[varNameInputs.length - 1];
        const lastValueInput = varValueInputs[varValueInputs.length - 1];

        await lastNameInput.fill('baseUrl');
        await lastValueInput.fill('https://api.example.com');
        await window.screenshot({
          path: 'e2e-results/screenshots/variables-03-first-var-added.png',
        });
      }

      // Add another variable
      await addVariableButton.click();
      await window.waitForTimeout(500);

      const varNameInputs2 = await window
        .locator(
          'input[placeholder*="Name"], input[placeholder*="Variable"], input[placeholder*="名前"]',
        )
        .all();
      const varValueInputs2 = await window
        .locator('input[placeholder*="Value"], input[placeholder*="値"]')
        .all();

      if (varNameInputs2.length > 1 && varValueInputs2.length > 1) {
        const lastNameInput2 = varNameInputs2[varNameInputs2.length - 1];
        const lastValueInput2 = varValueInputs2[varValueInputs2.length - 1];

        await lastNameInput2.fill('apiToken');
        await lastValueInput2.fill('test-token-12345');
        await window.screenshot({
          path: 'e2e-results/screenshots/variables-04-second-var-added.png',
        });
      }
    }

    // Close variables panel
    const closeButton = await window
      .locator('button[aria-label*="Close"], button:has-text("×")')
      .first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await window.waitForTimeout(500);
    }

    // Use variables in URL
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('{{baseUrl}}/users');
    await window.screenshot({ path: 'e2e-results/screenshots/variables-05-url-with-var.png' });

    // Use variables in headers
    const headersTab = await window
      .locator('button:has-text("Headers"), button:has-text("ヘッダー")')
      .first();
    await headersTab.click();
    await window.waitForTimeout(500);

    const addHeaderButton = await window
      .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
      .first();
    if (await addHeaderButton.isVisible()) {
      await addHeaderButton.click();
      await window.waitForTimeout(500);

      const headerKeyInputs = await window
        .locator('input[placeholder*="Key"], input[placeholder*="key"], input[placeholder*="キー"]')
        .all();
      const headerValueInputs = await window
        .locator(
          'input[placeholder*="Value"], input[placeholder*="value"], input[placeholder*="値"]',
        )
        .all();

      if (headerKeyInputs.length > 0 && headerValueInputs.length > 0) {
        const lastKeyInput = headerKeyInputs[headerKeyInputs.length - 1];
        const lastValueInput = headerValueInputs[headerValueInputs.length - 1];

        await lastKeyInput.fill('Authorization');
        await lastValueInput.fill('Bearer {{apiToken}}');
        await window.screenshot({
          path: 'e2e-results/screenshots/variables-06-header-with-var.png',
        });
      }
    }
  });

  test('should extract variables from response', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/variables-07-extract-initial.png' });

    // Send a request first
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://jsonplaceholder.typicode.com/users/1');

    const sendButton = await window
      .locator('button:has-text("Send"), button:has-text("送信")')
      .first();
    await sendButton.click();

    // Wait for response
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/variables-08-response-received.png' });

    // Look for variable extraction option
    const extractButton = await window
      .locator('button:has-text("Extract"), button:has-text("抽出"), button[title*="Extract"]')
      .first();
    if (await extractButton.isVisible()) {
      await extractButton.click();
      await window.waitForTimeout(500);

      // If extraction panel opens, configure extraction
      const pathInput = await window
        .locator('input[placeholder*="Path"], input[placeholder*="JSONPath"]')
        .first();
      const varNameInput = await window
        .locator('input[placeholder*="Variable name"], input[placeholder*="変数名"]')
        .first();

      if ((await pathInput.isVisible()) && (await varNameInput.isVisible())) {
        await pathInput.fill('$.id');
        await varNameInput.fill('userId');
        await window.screenshot({
          path: 'e2e-results/screenshots/variables-09-extraction-configured.png',
        });

        // Save extraction
        const saveExtractButton = await window
          .locator('button:has-text("Save"), button:has-text("OK"), button:has-text("保存")')
          .last();
        if (await saveExtractButton.isVisible()) {
          await saveExtractButton.click();
          await window.waitForTimeout(500);
        }
      }
    }
  });

  test('should use environment variables', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'e2e-results/screenshots/variables-10-env-initial.png' });

    // Check if environment selector exists
    const envSelector = await window
      .locator('select[aria-label*="Environment"], select[title*="Environment"]')
      .first();
    if (await envSelector.isVisible()) {
      // Create or select an environment
      const options = await envSelector.locator('option').all();
      if (options.length > 1) {
        await envSelector.selectOption({ index: 1 });
        await window.waitForTimeout(500);
      }
    }

    // Open variables panel
    const variablesButton = await window
      .locator('button:has-text("Variables"), button:has-text("変数"), button[title*="Variables"]')
      .first();
    await variablesButton.click();
    await window.waitForTimeout(1000);
    await window.screenshot({ path: 'e2e-results/screenshots/variables-11-env-panel.png' });

    // Switch to environment variables tab if available
    const envTab = await window
      .locator('button:has-text("Environment"), button:has-text("環境")')
      .first();
    if (await envTab.isVisible()) {
      await envTab.click();
      await window.waitForTimeout(500);

      // Add environment-specific variable
      const addVariableButton = await window
        .locator('button:has-text("Add"), button:has-text("追加"), button:has-text("+")')
        .first();
      if (await addVariableButton.isVisible()) {
        await addVariableButton.click();
        await window.waitForTimeout(500);

        const varNameInputs = await window
          .locator(
            'input[placeholder*="Name"], input[placeholder*="Variable"], input[placeholder*="名前"]',
          )
          .all();
        const varValueInputs = await window
          .locator('input[placeholder*="Value"], input[placeholder*="値"]')
          .all();

        if (varNameInputs.length > 0 && varValueInputs.length > 0) {
          const lastNameInput = varNameInputs[varNameInputs.length - 1];
          const lastValueInput = varValueInputs[varValueInputs.length - 1];

          await lastNameInput.fill('apiEndpoint');
          await lastValueInput.fill('https://staging-api.example.com');
          await window.screenshot({
            path: 'e2e-results/screenshots/variables-12-env-var-added.png',
          });
        }
      }
    }
  });
});
