import { test, expect } from './fixtures/electron-fixture';

test('Electron app launches', async ({ electronApp }) => {
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    return app.isPackaged;
  });

  expect(isPackaged).toBe(false);
});
