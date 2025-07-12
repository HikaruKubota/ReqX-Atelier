# コンポーネント複雑度詳細レポート

## 1. 複雑度メトリクス

### 評価基準

- **行数**: コンポーネントのサイズ
- **状態数**: useState/useRef/useContextの使用数
- **副作用数**: useEffectの使用数
- **責務数**: 単一責任原則からの逸脱度
- **依存度**: 外部モジュール/ストアへの依存

## 2. 最も複雑なコンポーネント詳細分析

### App.tsx（680行）

**複雑度スコア: 🔴 9/10**

#### 問題点

1. **過剰な状態管理**

   ```typescript
   // 21個の状態管理
   - 7個のuseState
   - 4個のuseRef
   - 10個のコールバック関数
   ```

2. **責務の混在**

   - タブ管理
   - リクエスト実行
   - 状態同期
   - レイアウト管理
   - イベントハンドリング

3. **複雑な状態同期ロジック**
   ```typescript
   // 行454-542: タブ切り替え時の複雑な同期処理
   useEffect(() => {
     // 複数の状態を同期更新
   }, [activeTab, savedRequests, ...]);
   ```

#### リファクタリング提案

```typescript
// Before: App.tsx (680行)
function App() {
  // すべての機能が混在
}

// After: 責務分離
├── AppContainer.tsx      // レイアウトのみ
├── TabManager.tsx        // タブ管理専用
├── RequestManager.tsx    // リクエスト処理
└── useAppState.ts        // 状態管理統合
```

### VariablesPanel.tsx（441行）

**複雑度スコア: 🔴 8/10**

#### 問題点

1. **内部コンポーネントの肥大化**

   ```typescript
   // VariableRow: 118行の関数コンポーネント
   const VariableRow = ({ variable, ... }) => {
     // 複雑なUIロジック
   };
   ```

2. **ビジネスロジックとUIの混在**
   - 変数のCRUD操作
   - フィルタリング処理
   - バリデーション
   - UI表示制御

#### リファクタリング提案

```typescript
// 分離案
├── VariablesPanel.tsx         // コンテナ（50行）
├── VariablesList.tsx          // リスト表示（100行）
├── VariableRow.tsx            // 行コンポーネント（80行）
├── VariableForm.tsx           // 編集フォーム（60行）
└── useVariablesPanel.ts       // ロジック（100行）
```

### RequestCollectionTree.tsx（388行）

**複雑度スコア: 🟡 7/10**

#### 問題点

1. **巨大なレンダリング関数（164行）**
2. **複雑なドラッグ&ドロップ処理**
3. **深いコンポーネントネスト**

#### 改善例

```typescript
// レンダリング関数の分割
const renderTreeNode = (node) => <TreeNode {...node} />;
const renderFolder = (folder) => <FolderNode {...folder} />;
const renderRequest = (request) => <RequestNode {...request} />;
```

## 3. Atomic Design違反の分析

### 誤った階層配置

| コンポーネント  | 現在      | あるべき階層 | 理由                  |
| --------------- | --------- | ------------ | --------------------- |
| VariableTooltip | Atoms     | Molecules    | 複雑なロジック含有    |
| TabBar          | Organisms | Molecules    | 単純なラッパー        |
| RequestRow      | Atoms     | Molecules    | 複数のAtoms組み合わせ |

### Molecules不足の影響

- Atomsから直接複雑なコンポーネントへの飛躍
- 再利用可能な中間コンポーネントの欠如
- テストの困難性増大

## 4. 依存関係の問題

### 循環依存リスク

```
App.tsx
  ├─> savedRequestsStore
  │     └─> App.tsx (callback経由)
  └─> variablesStore
        └─> 複数コンポーネント
```

### 密結合の例

1. **直接的なストアアクセス**

   ```typescript
   // 悪い例：深い階層でのストア直接使用
   function DeepComponent() {
     const store = useSavedRequestsStore();
   }
   ```

2. **プロップスドリリング回避の副作用**
   - コンポーネントの再利用性低下
   - テストの複雑化

## 5. パフォーマンスへの影響

### 再レンダリングの連鎖

```
状態更新 → App.tsx全体再レンダリング
         → 全子コンポーネント再評価
         → 不要なDOM更新
```

### メモリ使用量

- 大きなコンポーネントの全体再作成
- 不要なクロージャの保持
- メモリリークのリスク

## 6. 推奨改善アプローチ

### Phase 1: 即時対応（1週間）

1. App.tsxの機能別分割
2. 大きなレンダリング関数の分離
3. 内部関数コンポーネントの外部化

### Phase 2: 構造改善（2-3週間）

1. Moleculesレベルの充実
2. カスタムフックへのロジック移動
3. 選択的サブスクリプションの導入

### Phase 3: 最適化（1ヶ月）

1. React.memoの適切な適用
2. useMemo/useCallbackの最適化
3. 仮想化の拡大適用
