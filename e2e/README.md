# E2E Tests

This directory contains end-to-end tests for the ReqX-Atelier Electron application using Playwright.

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

## Ubuntu/Linux Requirements

On Ubuntu and other Linux distributions, Electron requires additional system dependencies to run in headless environments. Install them with:

```bash
sudo apt-get update
sudo apt-get install -y \
  xvfb \
  libnss3 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libgbm1 \
  libxss1 \
  libasound2 \
  libxshmfence1
```

For headless environments, tests should be run with xvfb:

```bash
xvfb-run -a npm run e2e
```

## Troubleshooting

### "Process failed to launch!" Error

This error typically occurs when required system dependencies are missing. The electron fixture will log helpful error messages indicating which packages need to be installed.

### Testing Electron Launch

You can test if Electron launches successfully with the E2E configuration using:

```bash
node scripts/test-e2e-launch.js
```

This will attempt to launch Electron with the same arguments used in E2E tests.

## CI Configuration

The GitHub Actions workflow automatically:

1. Installs required system dependencies on Ubuntu
2. Uses xvfb-run for Linux tests
3. Applies appropriate launch flags for headless environments

## Electron Launch Flags

The following flags are automatically applied in CI/Linux environments to ensure stable operation:

- `--no-sandbox`: Required for running in containers
- `--disable-setuid-sandbox`: Disable setuid sandbox
- `--disable-gpu`: Disable GPU hardware acceleration
- `--disable-dev-shm-usage`: Overcome limited resource problems
- `--use-gl=swiftshader`: Force software rendering
- `--headless`: Run in headless mode (Linux CI only)
