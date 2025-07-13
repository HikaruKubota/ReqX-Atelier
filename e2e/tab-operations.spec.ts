import { test, expect } from './fixtures/electron-fixture';

test.describe('Tab Operations', () => {
  test('should create multiple tabs and switch between them', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Count initial tabs
    const initialTabs = await window.locator('[role="tab"], button[class*="tab"]').count();

    // Create a new tab
    const newTabButton = await window
      .locator('button[title*="New"], button[title*="新規"], button:has-text("+")')
      .first();
    await newTabButton.click();

    await window.waitForTimeout(1000);

    // Verify tab count increased
    const afterFirstNewTab = await window.locator('[role="tab"], button[class*="tab"]').count();
    expect(afterFirstNewTab).toBe(initialTabs + 1);

    // Create another tab
    await newTabButton.click();
    await window.waitForTimeout(1000);

    const afterSecondNewTab = await window.locator('[role="tab"], button[class*="tab"]').count();
    expect(afterSecondNewTab).toBe(initialTabs + 2);

    // Fill different URLs in different tabs
    const urlInput1 = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput1.fill('https://api.example.com/users');

    // Switch to first tab
    const firstTab = await window.locator('[role="tab"], button[class*="tab"]').first();
    await firstTab.click();
    await window.waitForTimeout(500);

    // Verify URL is different or empty
    const urlInput2 = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    const firstTabUrl = await urlInput2.inputValue();
    expect(firstTabUrl).not.toBe('https://api.example.com/users');
  });

  test('should close tabs', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Create new tabs
    const newTabButton = await window
      .locator('button[title*="New"], button[title*="新規"], button:has-text("+")')
      .first();
    await newTabButton.click();
    await window.waitForTimeout(500);
    await newTabButton.click();
    await window.waitForTimeout(500);

    // Count tabs
    const tabCount = await window.locator('[role="tab"], button[class*="tab"]').count();

    // Close a tab (look for close button on active tab)
    const closeButton = await window
      .locator(
        '[role="tab"] button[aria-label*="Close"], button[class*="close"], button:has-text("×")',
      )
      .first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await window.waitForTimeout(500);

      // Verify tab count decreased
      const newTabCount = await window.locator('[role="tab"], button[class*="tab"]').count();
      expect(newTabCount).toBe(tabCount - 1);
    }
  });

  test('should maintain tab content when switching', async ({ window }) => {
    // Wait for app to be ready
    await window.waitForTimeout(3000);

    // Fill first tab with data
    const urlInput = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput.fill('https://api.test.com/endpoint1');

    // Create new tab
    const newTabButton = await window
      .locator('button[title*="New"], button[title*="新規"], button:has-text("+")')
      .first();
    await newTabButton.click();
    await window.waitForTimeout(1000);

    // Fill second tab with different data
    const urlInput2 = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    await urlInput2.fill('https://api.test.com/endpoint2');

    // Switch back to first tab
    const firstTab = await window.locator('[role="tab"], button[class*="tab"]').first();
    await firstTab.click();
    await window.waitForTimeout(500);

    // Verify first tab still has its data
    const urlInput3 = await window
      .locator('input[placeholder*="URL"], input[placeholder*="url"]')
      .first();
    const firstTabUrl = await urlInput3.inputValue();
    expect(firstTabUrl).toBe('https://api.test.com/endpoint1');
  });
});
