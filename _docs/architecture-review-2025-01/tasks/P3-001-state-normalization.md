# P3-001: 状態の正規化

## 概要

Zustandストアのデータ構造を正規化し、パフォーマンスとデータ整合性を向上させる。

## 現状の問題点

- フラットな配列構造による検索の非効率性
- 親子関係の管理が複雑
- 大量データ時のパフォーマンス低下
- 更新時の不整合リスク

## 実装計画

### Step 1: 正規化設計

1. 現在の構造

```typescript
{
  savedRequests: SavedRequest[],
  folders: Folder[]
}
```

2. 正規化後の構造

```typescript
{
  requests: {
    byId: { [id: string]: SavedRequest },
    allIds: string[]
  },
  folders: {
    byId: { [id: string]: Folder },
    allIds: string[],
    rootIds: string[]
  }
}
```

### Step 2: 正規化ヘルパーの実装

```typescript
// normalizers.ts
export const normalizeRequests = (requests: SavedRequest[]) => {
  const byId: Record<string, SavedRequest> = {};
  const allIds: string[] = [];

  requests.forEach((request) => {
    byId[request.id] = request;
    allIds.push(request.id);
  });

  return { byId, allIds };
};
```

### Step 3: セレクターの実装

```typescript
// selectors.ts
export const selectAllRequests = (state) =>
  state.requests.allIds.map((id) => state.requests.byId[id]);

export const selectRequestsByFolder = (state, folderId) =>
  state.requests.allIds
    .filter((id) => state.requests.byId[id].folderId === folderId)
    .map((id) => state.requests.byId[id]);
```

### Step 4: ストアアクションの更新

1. CRUD操作の最適化
2. バッチ更新の実装
3. トランザクション的な操作

### Step 5: マイグレーション戦略

1. 既存データの変換処理
2. 後方互換性の確保
3. 段階的な移行計画

### Step 6: パフォーマンステスト

1. 大量データでのベンチマーク
2. メモリ使用量の測定
3. 更新処理の速度比較

## 完了条件

- [ ] 正規化されたデータ構造の実装
- [ ] 全ての既存機能が正常動作
- [ ] 1000件以上のデータで検索が100ms以内
- [ ] メモリ使用量が30%削減
- [ ] マイグレーションが自動実行

## 見積もり工数

5日（フルタイム換算）

## 依存関係

- P0-003（savedRequestsStore分割）の完了が必須

## リスクと対策

- **リスク**: 既存データの変換エラー
  - **対策**: 十分なテストとバックアップ機能
- **リスク**: セレクターの複雑化
  - **対策**: reselect等のメモ化ライブラリ活用
