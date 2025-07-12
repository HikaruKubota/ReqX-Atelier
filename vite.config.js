import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // ① 開発サーバとビルドのルートを renderer ディレクトリに固定
  root: resolve(__dirname, 'src/renderer'),

  plugins: [react()],

  // ② 本番ビルドの出力先をプロジェクト直下 dist/ に集約
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  // Electronアプリ用に相対パスでビルド
  base: './',

  // ③ Vitest 設定（既存）
  test: {
    globals: true,
    environment: 'jsdom',

    // setup ファイルを絶対パスで指定
    setupFiles: resolve(__dirname, 'src/test/setup.ts'),

    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      exclude: ['**/*.stories.*', '**/node_modules/**', '**/dist/**'],
    },
  },
});
