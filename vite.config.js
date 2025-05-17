import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      exclude: ['**/*.stories.*', '**/node_modules/**', '**/dist/**'],
    },
  },
});
