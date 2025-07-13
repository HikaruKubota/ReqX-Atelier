import { test, expect } from './fixtures/electron-fixture';

test.describe('Basic Smoke Tests', () => {
  test('should launch the application', async ({ window }) => {
    const title = await window.title();
    expect(title).toBeTruthy();

    await window.screenshot({ path: 'e2e-results/screenshots/app-launched.png' });
  });

  test('should have URL input field', async ({ window }) => {
    await window.waitForTimeout(5000);

    const inputs = await window.locator('input').count();
    expect(inputs).toBeGreaterThan(0);

    await window.screenshot({ path: 'e2e-results/screenshots/inputs-visible.png' });
  });

  test('should have Send button', async ({ window }) => {
    await window.waitForTimeout(5000);

    const buttons = await window.locator('button').count();
    expect(buttons).toBeGreaterThan(0);

    await window.screenshot({ path: 'e2e-results/screenshots/buttons-visible.png' });
  });
});
