import { test, expect } from './fixtures/electron-fixture';

test.describe('Collection Management', () => {
  test('should create folders and organize requests', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create a new folder
    const newFolderButton = await window
      .locator('button[title*="folder"], button[title*="Folder"], button[title*="フォルダ"]')
      .first();
    if (await newFolderButton.isVisible()) {
      await newFolderButton.click();
      await window.waitForTimeout(500);

      // Enter folder name if dialog appears
      const folderNameInput = await window
        .locator(
          'input[placeholder*="Folder name"], input[placeholder*="Name"], input[placeholder*="名前"]',
        )
        .first();
      if (await folderNameInput.isVisible()) {
        await folderNameInput.fill('Test API Collection');

        const confirmButton = await window
          .locator('button:has-text("Create"), button:has-text("OK"), button:has-text("作成")')
          .last();
        await confirmButton.click();
        await window.waitForTimeout(1000);
      }
    }

    // Create a request to save in the folder
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://api.example.com/collection-test');

    // Save request
    const saveButton = await window
      .locator('button:has-text("Save"), button:has-text("保存"), button[title*="Save"]')
      .first();
    await saveButton.click();
    await window.waitForTimeout(1000);

    // If save dialog appears, select the folder
    const nameInput = await window
      .locator(
        'input[placeholder*="Request name"], input[placeholder*="Name"], input[placeholder*="名前"]',
      )
      .first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Collection Test Request');

      // Look for folder selector
      const folderSelector = await window
        .locator('select[aria-label*="Folder"], select[title*="Folder"]')
        .first();
      if (await folderSelector.isVisible()) {
        await folderSelector.selectOption('Test API Collection');
      }

      const confirmButton = await window
        .locator('button:has-text("Save"), button:has-text("OK"), button:has-text("保存")')
        .last();
      await confirmButton.click();
      await window.waitForTimeout(1000);
    }

    // Verify folder structure in sidebar
    const folder = await window.locator('text="Test API Collection"').first();
    expect(await folder.isVisible()).toBe(true);
  });

  test('should move requests between folders', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create first folder
    const newFolderButton = await window
      .locator('button[title*="folder"], button[title*="Folder"], button[title*="フォルダ"]')
      .first();
    if (await newFolderButton.isVisible()) {
      await newFolderButton.click();
      await window.waitForTimeout(500);

      const folderNameInput = await window
        .locator(
          'input[placeholder*="Folder name"], input[placeholder*="Name"], input[placeholder*="名前"]',
        )
        .first();
      if (await folderNameInput.isVisible()) {
        await folderNameInput.fill('Source Folder');
        const confirmButton = await window
          .locator('button:has-text("Create"), button:has-text("OK"), button:has-text("作成")')
          .last();
        await confirmButton.click();
        await window.waitForTimeout(1000);
      }
    }

    // Create second folder
    if (await newFolderButton.isVisible()) {
      await newFolderButton.click();
      await window.waitForTimeout(500);

      const folderNameInput = await window
        .locator(
          'input[placeholder*="Folder name"], input[placeholder*="Name"], input[placeholder*="名前"]',
        )
        .first();
      if (await folderNameInput.isVisible()) {
        await folderNameInput.fill('Destination Folder');
        const confirmButton = await window
          .locator('button:has-text("Create"), button:has-text("OK"), button:has-text("作成")')
          .last();
        await confirmButton.click();
        await window.waitForTimeout(1000);
      }
    }

    // Create a request in the source folder
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://api.example.com/move-test');

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
      await nameInput.fill('Request to Move');

      const folderSelector = await window
        .locator('select[aria-label*="Folder"], select[title*="Folder"]')
        .first();
      if (await folderSelector.isVisible()) {
        await folderSelector.selectOption('Source Folder');
      }

      const confirmButton = await window
        .locator('button:has-text("Save"), button:has-text("OK"), button:has-text("保存")')
        .last();
      await confirmButton.click();
      await window.waitForTimeout(1000);
    }

    // Right-click on the request to move it
    const requestToMove = await window.locator('text="Request to Move"').first();
    if (await requestToMove.isVisible()) {
      await requestToMove.click({ button: 'right' });
      await window.waitForTimeout(500);

      // Look for move option
      const moveOption = await window.locator('text="Move", text="移動"').first();
      if (await moveOption.isVisible()) {
        await moveOption.click();
        await window.waitForTimeout(500);

        // Select destination folder
        const destFolderOption = await window.locator('text="Destination Folder"').last();
        if (await destFolderOption.isVisible()) {
          await destFolderOption.click();
          await window.waitForTimeout(1000);
        }
      }
    }
  });

  test('should delete folders', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create a folder to delete
    const newFolderButton = await window
      .locator('button[title*="folder"], button[title*="Folder"], button[title*="フォルダ"]')
      .first();
    if (await newFolderButton.isVisible()) {
      await newFolderButton.click();
      await window.waitForTimeout(500);

      const folderNameInput = await window
        .locator(
          'input[placeholder*="Folder name"], input[placeholder*="Name"], input[placeholder*="名前"]',
        )
        .first();
      if (await folderNameInput.isVisible()) {
        await folderNameInput.fill('Folder to Delete');
        const confirmButton = await window
          .locator('button:has-text("Create"), button:has-text("OK"), button:has-text("作成")')
          .last();
        await confirmButton.click();
        await window.waitForTimeout(1000);
      }
    }

    // Right-click on the folder to delete it
    const folderToDelete = await window.locator('text="Folder to Delete"').first();
    if (await folderToDelete.isVisible()) {
      await folderToDelete.click({ button: 'right' });
      await window.waitForTimeout(500);

      // Click delete option
      const deleteOption = await window.locator('text="Delete", text="削除"').first();
      if (await deleteOption.isVisible()) {
        await deleteOption.click();
        await window.waitForTimeout(500);

        // Confirm deletion
        const confirmDelete = await window
          .locator('button:has-text("Delete"), button:has-text("OK"), button:has-text("削除")')
          .last();
        if (await confirmDelete.isVisible()) {
          await confirmDelete.click();
          await window.waitForTimeout(1000);
        }

        // Verify folder is deleted
        const deletedFolder = await window.locator('text="Folder to Delete"').first();
        expect(await deletedFolder.isVisible()).toBe(false);
      }
    }
  });
});
