# P1-001: 選択的サブスクリプション導入

## 概要

Zustandストアの使用箇所で選択的サブスクリプションを導入し、不要な再レンダリングを削減する。

## 現状の問題点

- ストア全体を購読しているコンポーネントが多数存在
- 関係ない状態変更でも再レンダリングが発生
- パフォーマンスの低下
- React DevToolsで過剰なレンダリングが確認できる

## 実装計画

### Step 1: 影響調査とベンチマーク

1. 現在のレンダリング頻度を測定
2. React DevTools Profilerでボトルネックを特定
3. 改善対象コンポーネントのリストアップ

### Step 2: 高頻度レンダリングコンポーネントの修正

1. App.tsx関連

```typescript
// Before
const store = useSavedRequestsStore();

// After
const savedRequests = useSavedRequestsStore((state) => state.savedRequests);
const addRequest = useSavedRequestsStore((state) => state.addRequest);
```

2. RequestCollectionTree.tsx

```typescript
// セレクター関数の作成
const selectTreeData = (state) => ({
  folders: state.folders,
  requests: state.savedRequests.filter((r) => r.folderId === state.selectedFolderId),
});

// 使用
const treeData = useSavedRequestsStore(selectTreeData);
```

### Step 3: VariablesPanel.tsxの最適化

1. 変数リストと編集フォームの分離
2. 個別の変数更新による影響を最小化
3. メモ化の適用

### Step 4: パフォーマンステスト

1. 改善前後のレンダリング回数比較
2. ユーザー操作のレスポンス時間測定
3. メモリ使用量の確認

### Step 5: ベストプラクティスの文書化

1. 選択的サブスクリプションのガイドライン作成
2. コードレビューチェックリストへの追加
3. チーム内での知識共有

## 完了条件

- [ ] 主要コンポーネント10個以上で選択的サブスクリプション実装
- [ ] レンダリング回数が平均50%削減
- [ ] パフォーマンステストの結果が改善
- [ ] ドキュメント作成完了

## 見積もり工数

2日（フルタイム換算）

## 依存関係

- なし（Quick Winとして独立実行可能）

## リスクと対策

- **リスク**: セレクター関数の複雑化
  - **対策**: reselect等のメモ化ライブラリの検討
- **リスク**: 過度な最適化による可読性低下
  - **対策**: 明確な命名規則とコメントの追加
