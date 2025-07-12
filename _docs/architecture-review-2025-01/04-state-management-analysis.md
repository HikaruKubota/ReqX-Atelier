# 状態管理詳細分析レポート

## 1. Zustand実装パターン分析

### ストア構成概要

| ストア名           | ファイルサイズ | アクション数 | 状態の複雑度 | パフォーマンス影響 |
| ------------------ | -------------- | ------------ | ------------ | ------------------ |
| savedRequestsStore | 315行          | 21個         | 🔴 高        | 大                 |
| folderTreeStore    | 444行          | 15個         | 🟡 中-高     | 中                 |
| variablesStore     | 232行          | 12個         | 🟡 中        | 小                 |
| themeStore         | 22行           | 1個          | 🟢 低        | 極小               |

## 2. savedRequestsStore深掘り分析

### 責務の肥大化

```typescript
// 現在: 単一ストアに多数の責務
interface SavedRequestsStore {
  // データ管理
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];

  // CRUD操作（21個のアクション）
  addRequest: () => void;
  updateRequest: () => void;
  deleteRequest: () => void;
  // ... 18個の追加アクション

  // マイグレーション（80行）
  migrate: () => void;

  // 再帰的操作
  copyFolderRecursive: () => void;
  deleteFolderRecursive: () => void;
}
```

### マイグレーション処理の問題

```typescript
// 複雑なマイグレーションロジック（行25-103）
persist: {
  migrate: (persistedState: any) => {
    // 複数バージョンへの対応
    // エラーハンドリングなし
    // デバッグ困難
  };
}
```

### 推奨: ストア分割案

```typescript
// 責務別に分割
├── useRequestsStore.ts      // リクエストCRUD
├── useFoldersStore.ts       // フォルダCRUD
├── useMigrationStore.ts     // マイグレーション専用
└── useRequestHelpers.ts     // 再帰的操作等のヘルパー
```

## 3. 状態の正規化問題

### 現在の非正規化構造

```typescript
interface SavedFolder {
  id: string;
  name: string;
  requestIds: string[]; // 🔴 問題: IDの重複管理
  parentId: string | null;
}

// フォルダ移動時の処理
moveRequest: (requestId, toFolderId) => {
  // 1. 元フォルダからrequestId削除
  // 2. 新フォルダにrequestId追加
  // 3. 複数箇所の更新が必要
};
```

### 推奨: 正規化構造

```typescript
interface NormalizedState {
  requests: {
    byId: Record<string, SavedRequest>;
    allIds: string[];
  };
  folders: {
    byId: Record<string, SavedFolder>;
    allIds: string[];
  };
  // 関係性を別管理
  requestFolderMap: Record<string, string>;
}
```

## 4. App.tsx内の状態管理混在

### 問題のある状態管理パターン

```typescript
function App() {
  // 🔴 Zustandストア
  const { savedRequests } = useSavedRequestsStore();

  // 🔴 ローカル状態（複雑なオブジェクト）
  const [tabEditorStates, setTabEditorStates] = useState<
    Record<string, ComplexEditorState>
  >({});

  // 🔴 Ref（非制御状態）
  const editorRef = useRef<EditorAPI>();

  // 🔴 複雑な同期ロジック
  useEffect(() => {
    // タブ切り替え時の状態同期
    // 100行以上の処理
  }, [activeTab, savedRequests, ...]);
}
```

### 影響

- 状態の追跡困難
- デバッグの複雑化
- パフォーマンス低下
- テストの困難性

## 5. パフォーマンス問題の詳細

### 不要な再レンダリング

```typescript
// 🔴 問題: ストア全体を監視
const store = useSavedRequestsStore();

// 🟢 改善: 選択的サブスクリプション
const requests = useSavedRequestsStore((state) => state.savedRequests);
const addRequest = useSavedRequestsStore((state) => state.addRequest);
```

### 大量データ操作

```typescript
// 🔴 問題: 配列全体の再作成
updateFolder: (id, updates) =>
  set((state) => ({
    savedFolders: state.savedFolders.map((folder) =>
      folder.id === id ? { ...folder, ...updates } : folder,
    ),
  }));

// 🟢 改善: イミュータブル更新ライブラリ
import { produce } from 'immer';
updateFolder: (id, updates) =>
  set(
    produce((state) => {
      const folder = state.savedFolders.find((f) => f.id === id);
      if (folder) Object.assign(folder, updates);
    }),
  );
```

## 6. 副作用管理の問題

### 現在の課題

1. **暗黙的な副作用**

   - persistミドルウェアによる自動保存
   - エラー時の挙動が不明確

2. **副作用の分散**
   - コンポーネント内のuseEffect
   - ストア内のアクション
   - 統一的な管理なし

### 推奨パターン

```typescript
// 副作用を明示的に管理
const useRequestOperations = () => {
  const store = useSavedRequestsStore();
  const { showNotification } = useNotification();

  const addRequest = async (request: CreateRequestDto) => {
    try {
      const id = store.addRequest(request);
      await syncToBackend(id);
      showNotification('Request added successfully');
      return id;
    } catch (error) {
      store.removeRequest(id);
      showNotification('Failed to add request', 'error');
      throw error;
    }
  };

  return { addRequest };
};
```

## 7. 改善ロードマップ

### Phase 1: 即時改善（1週間）

- [ ] 選択的サブスクリプションの導入
- [ ] App.tsx内の状態整理
- [ ] 基本的なメモ化適用

### Phase 2: 構造改善（2-3週間）

- [ ] savedRequestsStoreの分割
- [ ] 状態正規化の実装
- [ ] カスタムフックへの移行

### Phase 3: 最適化（1ヶ月）

- [ ] Immer導入によるイミュータブル更新
- [ ] Redux Toolkit風のスライス設計
- [ ] 副作用管理システムの構築

## 8. 推奨ツール/ライブラリ

1. **immer**: イミュータブル更新の簡略化
2. **zustand/middleware**: devtools, subscribeWithSelector
3. **react-query**: サーバー状態の管理（将来的な拡張用）
4. **zod**: ランタイム型検証（マイグレーション安全性）
