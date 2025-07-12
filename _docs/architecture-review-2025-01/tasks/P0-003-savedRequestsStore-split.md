# P0-003: savedRequestsStore分割

## 概要

850行を超えるsavedRequestsStoreを機能別に分割し、保守性を向上させる。現在、リクエスト管理、フォルダ管理、マイグレーション処理が混在している。

## 現状の問題点

- 単一ストアに多数の責務が集中
- テストが複雑で時間がかかる
- 新機能追加時の影響範囲が大きい
- ストアの初期化処理が重い

## 実装計画

### Step 1: ストア構造の設計

1. 新しいディレクトリ構造

```
src/renderer/src/store/requests/
├── index.ts              # 統合エクスポート
├── requestsSlice.ts      # リクエストCRUD
├── foldersSlice.ts       # フォルダCRUD
├── migrationSlice.ts     # データマイグレーション
├── selectors.ts          # 共通セレクター
└── types.ts              # 型定義
```

### Step 2: requestsSlice.tsの実装

1. リクエスト関連の処理を抽出
   - addRequest
   - updateRequest
   - deleteRequest
   - duplicateRequest
2. リクエスト検索・フィルタリング機能
3. 単体テストの実装

### Step 3: foldersSlice.tsの実装

1. フォルダ関連の処理を抽出
   - createFolder
   - updateFolder
   - deleteFolder
   - moveFolder
2. フォルダツリー操作ユーティリティ
3. 単体テストの実装

### Step 4: migrationSlice.tsの実装

1. データマイグレーション処理を分離
2. バージョン管理ロジック
3. 後方互換性の確保
4. マイグレーションテストの実装

### Step 5: 統合レイヤーの実装

1. 各スライス間の連携処理
2. トランザクション的な操作の実装
3. パフォーマンス最適化

### Step 6: 移行作業

1. 既存コンポーネントの import 更新
2. 動作確認と回帰テスト
3. パフォーマンス測定

## 完了条件

- [ ] 各スライスが300行以下
- [ ] 各スライスに独立したテストが存在
- [ ] 既存の全機能が正常動作
- [ ] ストア初期化時間が50%以上改善
- [ ] npm run all が全てパス

## 見積もり工数

3-4日（フルタイム換算）

## 依存関係

- P0-001（App.tsx分割）と並行実行可能

## リスクと対策

- **リスク**: ストア間の依存関係が複雑化
  - **対策**: 明確なインターフェース定義と依存関係の文書化
- **リスク**: マイグレーション処理の不具合
  - **対策**: 十分なテストケースとロールバック機能
