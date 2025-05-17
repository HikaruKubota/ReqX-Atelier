import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // ① 開発サーバとビルドのルートを renderer ディレクトリに固定
  root: resolve(__dirname, 'src/renderer'),

  plugins: [react()],

  // ② 本番ビルドの出力先をプロジェクト直下 dist/ に集約
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  // ③ Vitest 設定（既存）
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'src/test/setup.ts'),
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      exclude: ['**/*.stories.*', '**/node_modules/**', '**/dist/**'],
    },
  },
});
