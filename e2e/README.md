# E2E Tests

This directory contains end-to-end tests for the ReqX-Atelier Electron application using Playwright.

## Supported Platforms

E2E tests are configured to run on:

- macOS
- Windows

Note: Linux/Ubuntu is not currently supported for E2E tests due to additional system dependencies required for headless Electron testing.

## Running Tests Locally

```bash
# Install dependencies
npm install

# Build the renderer
npm run build:renderer

# Install Playwright browsers
npx playwright install chromium

# Run E2E tests
npm run e2e
```

## Test Structure

- `fixtures/electron-fixture.ts` - Electron app launch configuration
- `basic-smoke.spec.ts` - Basic application launch and UI tests
- `simple-launch.spec.ts` - Simple app launch verification
- `request-operations.spec.ts` - Request creation and sending tests
- `tab-operations.spec.ts` - Tab management tests
- `headers-body-config.spec.ts` - Headers and body configuration tests
- `request-save-manage.spec.ts` - Request saving and management tests
- `variables-usage.spec.ts` - Variables functionality tests
- `collection-management.spec.ts` - Collection and folder management tests

## Writing New Tests

Use the provided fixtures to launch the Electron app:

```typescript
import { test, expect } from './fixtures/electron-fixture';

test('my test', async ({ window }) => {
  // Your test code here
  await expect(window.title()).resolves.toBeTruthy();
});
```

## Debugging Tests

To run tests with visible browser:

```bash
npm run e2e -- --headed
```

To run a specific test file:

```bash
npm run e2e -- e2e/basic-smoke.spec.ts
```

## CI Configuration

Tests run automatically on GitHub Actions for:

- Windows
- macOS

Test results and screenshots are uploaded as artifacts for debugging failed tests.
