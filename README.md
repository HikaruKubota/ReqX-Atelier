# ReqX Atelier - APIリクエストツール

ReqX Atelier は **Electron + React + Vite** で構築されたシンプルな API リクエストクライアントです。Tailwind CSS でスタイリングし、Vitest・Storybook・Playwright によるテスト基盤を同梱しています。

---

## 前提条件

- **Node.js** 20 以上
- **npm** (v10 以上推奨)

---

## セットアップ

```bash
 git clone <REPO_URL>
 cd ReqX-Atelier
 npm install
```

### Git Hooks の設定（オプション）

mainブランチへの直接pushを防ぐためのGit Hookを設定する場合：

```bash
git config core.hooksPath .githooks
```

---

## 開発 (ホットリロード)

### 通常開発

```bash
npm run dev
```

| プロセス       | 説明                      |
| -------------- | ------------------------- |
| `dev:renderer` | Vite 開発サーバー (React) |
| `dev:electron` | Electron メインプロセス   |

ブラウザと Electron ウィンドウの変更が即時反映されます。

---

### Storybookと同時起動

```bash
npm run dev:all
```

- ElectronアプリとStorybookを**同時に起動**します。
- Storybookは http://localhost:6006 で閲覧できます。

---

## テスト

### ユニット & インテグレーション (Vitest)

```bash
npm run test          # 一括実行
npm run test:watch    # 変更監視
```

- React Testing Library でコンポーネントを検証
- MSW で API をモックし、ビューモデルを結合テスト

### ビジュアル (Storybook)

```bash
npm run storybook         # 画面カタログ
npm run test-storybook    # Chromatic 用テスト
```

### E2E (Playwright)

```bash
npx playwright install     # 初回だけブラウザDL
npm run e2e
```

---

## ビルド

1. **レンダラー**
   ```bash
   npm run build:renderer
   ```
2. **Electron パッケージング**
   ```bash
   npm run build:electron
   ```

生成物は `dist/` に配置されます。
macOS では `.dmg`, Windows では `.exe` などが出力されます。

---

## リンティング & フォーマット

```bash
npm run lint     # ESLint
npm run format   # Prettier
npm run typecheck # 型チェック
```

---

## 主要スクリプト一覧

| スクリプト                         | 目的                            |
| ---------------------------------- | ------------------------------- |
| `dev`                              | 開発モード起動（Electron+Vite） |
| `dev:all`                          | Electron+Vite+Storybook同時起動 |
| `test`, `test:watch`               | Vitest 実行                     |
| `storybook`, `test-storybook`      | Storybook 関連                  |
| `e2e`                              | Playwright                      |
| `build:renderer`, `build:electron` | 本番ビルド                      |
| `lint`, `format`, `typecheck`      | コード品質チェック              |

---

ライセンス: MIT
