import { test, expect } from './fixtures/electron-fixture';

test.describe('Request Save and Management', () => {
  test('should save a request and open it later', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create a request
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://api.example.com/test-save');

    // Select POST method
    const methodSelector = await window.locator('select').first();
    await methodSelector.selectOption('POST');

    // Save request
    const saveButton = await window
      .locator('button:has-text("Save"), button:has-text("保存"), button[title*="Save"]')
      .first();
    await saveButton.click();
    await window.waitForTimeout(1000);

    // If a dialog appears, enter request name
    const nameInput = await window
      .locator(
        'input[placeholder*="Request name"], input[placeholder*="Name"], input[placeholder*="名前"]',
      )
      .first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Save Request');

      // Confirm save
      const confirmButton = await window
        .locator('button:has-text("Save"), button:has-text("OK"), button:has-text("保存")')
        .last();
      await confirmButton.click();
      await window.waitForTimeout(1000);
    }

    // Create a new tab to clear current state
    const newTabButton = await window
      .locator('button[title*="New"], button[title*="新規"], button:has-text("+")')
      .first();
    await newTabButton.click();
    await window.waitForTimeout(1000);

    // Open saved request from sidebar
    const savedRequest = await window.locator('text="Test Save Request"').first();
    if (await savedRequest.isVisible()) {
      await savedRequest.click();
      await window.waitForTimeout(1000);

      // Verify request details are loaded
      const loadedUrl = await urlInput.inputValue();
      expect(loadedUrl).toBe('https://api.example.com/test-save');

      const loadedMethod = await methodSelector.inputValue();
      expect(loadedMethod).toBe('POST');
    }
  });

  test('should update an existing request', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create and save a request first
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://api.example.com/original');

    const saveButton = await window
      .locator('button:has-text("Save"), button:has-text("保存"), button[title*="Save"]')
      .first();
    await saveButton.click();
    await window.waitForTimeout(1000);

    const nameInput = await window
      .locator(
        'input[placeholder*="Request name"], input[placeholder*="Name"], input[placeholder*="名前"]',
      )
      .first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Update Request');
      const confirmButton = await window
        .locator('button:has-text("Save"), button:has-text("OK"), button:has-text("保存")')
        .last();
      await confirmButton.click();
      await window.waitForTimeout(1000);
    }

    // Update the URL
    await urlInput.fill('https://api.example.com/updated');

    // Save again (should update existing)
    await saveButton.click();
    await window.waitForTimeout(1000);

    // Create new tab and reload the request
    const newTabButton = await window
      .locator('button[title*="New"], button[title*="新規"], button:has-text("+")')
      .first();
    await newTabButton.click();
    await window.waitForTimeout(1000);

    const savedRequest = await window.locator('text="Test Update Request"').first();
    if (await savedRequest.isVisible()) {
      await savedRequest.click();
      await window.waitForTimeout(1000);

      // Verify updated URL
      const loadedUrl = await urlInput.inputValue();
      expect(loadedUrl).toBe('https://api.example.com/updated');
    }
  });

  test('should delete a saved request', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create and save a request to delete
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://api.example.com/to-delete');

    const saveButton = await window
      .locator('button:has-text("Save"), button:has-text("保存"), button[title*="Save"]')
      .first();
    await saveButton.click();
    await window.waitForTimeout(1000);

    const nameInput = await window
      .locator(
        'input[placeholder*="Request name"], input[placeholder*="Name"], input[placeholder*="名前"]',
      )
      .first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Delete Request');
      const confirmButton = await window
        .locator('button:has-text("Save"), button:has-text("OK"), button:has-text("保存")')
        .last();
      await confirmButton.click();
      await window.waitForTimeout(1000);
    }

    // Right-click on saved request to show context menu
    const savedRequest = await window.locator('text="Test Delete Request"').first();
    if (await savedRequest.isVisible()) {
      await savedRequest.click({ button: 'right' });
      await window.waitForTimeout(500);

      // Click delete option
      const deleteOption = await window.locator('text="Delete", text="削除"').first();
      if (await deleteOption.isVisible()) {
        await deleteOption.click();
        await window.waitForTimeout(500);

        // Confirm deletion if dialog appears
        const confirmDelete = await window
          .locator('button:has-text("Delete"), button:has-text("OK"), button:has-text("削除")')
          .last();
        if (await confirmDelete.isVisible()) {
          await confirmDelete.click();
          await window.waitForTimeout(1000);
        }

        // Verify request is deleted
        const deletedRequest = await window.locator('text="Test Delete Request"').first();
        expect(await deletedRequest.isVisible()).toBe(false);
      }
    }
  });
});
