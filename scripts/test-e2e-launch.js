#!/usr/bin/env node

/**
 * Simple script to test Electron launch with the same arguments used in E2E tests
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

console.log('Testing Electron launch...');
console.log('Platform:', process.platform);
console.log('CI environment:', !!process.env.CI);

const mainPath = path.join(__dirname, '../main.js');
const args = [mainPath];

// Add arguments for CI/headless environments (same as in electron-fixture.ts)
if (process.env.CI || process.platform === 'linux') {
  args.push(
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-dev-shm-usage',
    '--use-gl=swiftshader', // cspell:disable-line
    '--disable-accelerated-2d-canvas',
    '--disable-gpu-sandbox',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-breakpad', // cspell:disable-line
  );

  if (process.env.CI && process.platform === 'linux') {
    args.push('--headless');
  }
}

console.log('Launching Electron with args:', args);

const electronPath = require('electron');
const electronProcess = spawn(electronPath, args, {
  env: {
    ...process.env,
    NODE_ENV: 'development',
    ELECTRON_DISABLE_GPU: '1',
    ELECTRON_DISABLE_SANDBOX: process.env.CI ? '1' : '0',
  },
  stdio: 'inherit',
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
  process.exit(code);
});

electronProcess.on('error', (err) => {
  console.error('Failed to start Electron:', err);
  console.error('\nMake sure the following packages are installed on Ubuntu:');
  console.error('  - xvfb');
  console.error('  - libnss3'); // cspell:disable-line
  console.error('  - libatk-bridge2.0-0'); // cspell:disable-line
  console.error('  - libgtk-3-0');
  console.error('  - libgbm1'); // cspell:disable-line
  console.error('Run: sudo apt-get install -y xvfb libnss3 libatk-bridge2.0-0 libgtk-3-0 libgbm1'); // cspell:disable-line
  process.exit(1);
});

// Give it 5 seconds to start, then kill it
setTimeout(() => {
  console.log('Electron started successfully, terminating test...');
  electronProcess.kill();
}, 5000);
