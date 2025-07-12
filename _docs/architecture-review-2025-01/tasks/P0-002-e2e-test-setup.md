# P0-002: E2Eテスト環境構築

## 概要

現在機能していないE2Eテスト環境を再構築し、主要なユーザーワークフローをカバーする自動テストを実装する。

## 現状の問題点

- E2Eテストが一つも動作していない
- Playwrightの設定が不完全
- Electron環境でのテスト実行が未対応
- 回帰テストが手動に依存

## 実装計画

### Step 1: Playwright環境の修正

1. 既存のplaywright.config.tsを確認・修正
2. Electron向けの設定を追加

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    // Electron specific settings
    browserName: 'chromium',
    launchOptions: {
      args: ['--no-sandbox'],
    },
  },
});
```

3. package.jsonのスクリプト修正

### Step 2: Electronアプリケーションの起動設定

1. テスト用のElectron起動スクリプト作成
2. テスト環境変数の設定
3. アプリケーション待機処理の実装

### Step 3: 基本的なE2Eテストの実装

1. アプリケーション起動テスト

```typescript
test('should launch application', async ({ page }) => {
  // アプリケーションが正常に起動することを確認
});
```

2. 新規リクエスト作成フロー

```typescript
test('should create new API request', async ({ page }) => {
  // 新規タブ作成
  // URL入力
  // メソッド選択
  // 保存確認
});
```

3. APIリクエスト実行フロー

```typescript
test('should execute API request', async ({ page }) => {
  // リクエスト設定
  // 送信ボタンクリック
  // レスポンス表示確認
});
```

### Step 4: CI/CD統合

1. GitHub Actionsワークフロー作成
2. テスト結果レポートの設定
3. 失敗時のスクリーンショット保存

### Step 5: テストデータとモックの準備

1. テスト用APIエンドポイントの準備
2. MSWとの統合設定
3. テストデータセットの作成

## 完了条件

- [ ] npm run e2e で最低5個のテストが実行可能
- [ ] 主要なユーザーフロー3つ以上がカバーされている
- [ ] CI/CDでE2Eテストが自動実行される
- [ ] テスト実行時間が5分以内
- [ ] テスト失敗時のデバッグ情報が十分

## 見積もり工数

2-3日（フルタイム換算）

## 依存関係

- なし（インフラ系の最優先タスク）

## リスクと対策

- **リスク**: Electron環境でのテスト実行が複雑
  - **対策**: Playwright Electronプラグインの活用
- **リスク**: テスト実行時間が長くなる
  - **対策**: 並列実行とテストの最適化
