# リファクタリングロードマップ

## 🎯 リファクタリング優先順位マトリクス

| 影響度＼実装難易度 | 低                       | 中                 | 高                   |
| ------------------ | ------------------------ | ------------------ | -------------------- |
| **高**             | 選択的サブスクリプション | App.tsx分割        | E2E環境構築          |
| **中**             | メモ化適用               | VariablesPanel分割 | 状態正規化           |
| **低**             | 型定義強化               | Molecules充実      | パフォーマンス最適化 |

## 📅 フェーズ別実装計画

### Phase 1: Quick Wins（1-2週間）

#### 1.1 App.tsx分割 🔴 最優先

**現状**: 680行のモノリシックコンポーネント

**実装手順**:

```bash
src/renderer/src/
├── App.tsx (100行に削減)
├── containers/
│   ├── AppLayout.tsx
│   ├── TabManager.tsx
│   └── StateSync.tsx
└── hooks/
    ├── useTabState.ts
    └── useRequestExecution.ts
```

**具体的なタスク**:

- [ ] TabManager.tsxの作成（タブ管理ロジック抽出）
- [ ] StateSync.tsxの作成（状態同期ロジック）
- [ ] AppLayout.tsxの作成（レイアウト責務）
- [ ] 各コンポーネントのテスト作成
- [ ] 統合テストの実装

**期待効果**:

- 保守性50%向上
- テスト容易性の大幅改善
- 新機能追加時間30%短縮

#### 1.2 選択的サブスクリプション導入 🟡

**実装例**:

```typescript
// Before
const store = useSavedRequestsStore();

// After
const requests = useSavedRequestsStore((state) => state.savedRequests);
const addRequest = useSavedRequestsStore((state) => state.addRequest);
```

**適用箇所**:

- [ ] App.tsx関連コンポーネント
- [ ] RequestCollectionTree.tsx
- [ ] VariablesPanel.tsx
- [ ] その他の大型コンポーネント

### Phase 2: 構造改善（3-4週間）

#### 2.1 VariablesPanel.tsx分割 🟡

**分割構造**:

```
VariablesPanel/
├── index.tsx              # コンテナ
├── VariablesList.tsx      # リスト表示
├── VariableRow.tsx        # 行コンポーネント
├── VariableForm.tsx       # 編集フォーム
├── useVariables.ts        # ビジネスロジック
└── __tests__/
```

#### 2.2 savedRequestsStore分割 🔴

**新構造**:

```typescript
// stores/requests/
├── requestsSlice.ts       // リクエストCRUD
├── foldersSlice.ts        // フォルダCRUD
├── migrationSlice.ts      // マイグレーション
└── index.ts               // 統合エクスポート
```

#### 2.3 E2Eテスト環境構築 🔴

**セットアップ**:

```bash
# Playwright設定
npm install -D @playwright/test

# 設定ファイル作成
touch playwright.config.ts
touch e2e/basic-workflow.spec.ts
```

**基本テストシナリオ**:

1. アプリケーション起動
2. 新規リクエスト作成
3. APIリクエスト実行
4. レスポンス確認
5. リクエスト保存

### Phase 3: 最適化（5-6週間）

#### 3.1 状態正規化 🟡

**実装アプローチ**:

```typescript
// 正規化ヘルパー
const normalizeRequests = (requests: SavedRequest[]) => {
  return requests.reduce(
    (acc, request) => {
      acc.byId[request.id] = request;
      acc.allIds.push(request.id);
      return acc;
    },
    { byId: {}, allIds: [] },
  );
};
```

#### 3.2 Atomic Design構造是正 🟢

**移動/作成タスク**:

- [ ] VariableTooltip → Molecules
- [ ] RequestRow → Molecules
- [ ] HeaderRow → Molecules
- [ ] 新規Molecules作成（10個程度）

#### 3.3 パフォーマンス最適化 🟢

**最適化項目**:

- [ ] React.memoの適切な適用
- [ ] useMemo/useCallbackの見直し
- [ ] 仮想化の拡大（大量データ対応）
- [ ] バンドルサイズ最適化

## 📊 成功指標（KPI）

### 技術的指標

| 指標                   | 現在  | 目標      | 測定方法   |
| ---------------------- | ----- | --------- | ---------- |
| 最大コンポーネント行数 | 680行 | 200行以下 | 静的解析   |
| テストカバレッジ       | 77%   | 85%以上   | Vitest     |
| E2Eテスト数            | 0     | 10以上    | Playwright |
| ビルド時間             | -     | 30秒以内  | CI/CD      |

### ビジネス指標

| 指標               | 現在 | 目標    | 測定方法  |
| ------------------ | ---- | ------- | --------- |
| 新機能実装時間     | -    | 30%短縮 | 開発ログ  |
| バグ発生率         | -    | 50%削減 | Issue追跡 |
| コードレビュー時間 | -    | 40%短縮 | PR統計    |

## 🚀 実装開始チェックリスト

### 準備フェーズ

- [ ] チーム内でロードマップ共有
- [ ] ブランチ戦略の決定
- [ ] CI/CDパイプライン準備
- [ ] テスト環境の整備

### 実装フェーズ

- [ ] 週次進捗レビュー設定
- [ ] ペアプログラミングセッション計画
- [ ] コードレビューガイドライン作成
- [ ] リファクタリング完了基準定義

### 検証フェーズ

- [ ] パフォーマンステスト実施
- [ ] ユーザビリティテスト
- [ ] 回帰テスト完了
- [ ] ドキュメント更新

## 💡 リスクと対策

### リスク1: 機能破壊

**対策**:

- 包括的なテストスイート作成
- 段階的な移行
- フィーチャーフラグの活用

### リスク2: 開発遅延

**対策**:

- タイムボックス設定
- MVP思考での実装
- 定期的な優先順位見直し

### リスク3: チーム抵抗

**対策**:

- 早期の合意形成
- 小さな成功体験の積み重ね
- 継続的なコミュニケーション
