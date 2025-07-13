# useEffectリファクタリング推奨事項

## 概要

このドキュメントは、コードベースで特定された複雑なuseEffectパターンに対する具体的なリファクタリング推奨事項を提供します。

## 1. 双方向同期のリファクタリング

### 現在の問題: `useUrlParamsSync`

無限ループを防ぐための複雑なフラグ管理を持つ2つのuseEffect。

### 推奨される解決策: 単一の真実の源

```typescript
// オプション1: Reducerパターンを使用
const [syncState, dispatch] = useReducer(urlParamsSyncReducer, {
  url: initialUrl,
  params: initialParams,
  source: 'none', // 'url' | 'params' | 'none'
});

// 外部更新を処理する単一のエフェクト
useEffect(() => {
  if (syncState.source === 'url') {
    onParamsChange(extractParamsFromUrl(syncState.url));
  } else if (syncState.source === 'params') {
    onUrlChange(buildUrlFromParams(syncState.url, syncState.params));
  }
}, [syncState]);

// オプション2: イベントベースのアプローチ
const handleUrlChange = useCallback(
  (newUrl: string) => {
    const newParams = extractParamsFromUrl(newUrl);
    onParamsChange(newParams);
  },
  [onParamsChange],
);

const handleParamsChange = useCallback(
  (newParams: KeyValuePair[]) => {
    const newUrl = buildUrlFromParams(url, newParams);
    onUrlChange(newUrl);
  },
  [url, onUrlChange],
);
```

## 2. タブ状態管理の簡素化

### 現在の問題: 重複する複数のuseEffect

### 推奨される解決策: 状態更新の統合

```typescript
// 複数のuseEffectの代わりに、単一の状態更新関数を使用
const updateTabState = useCallback(
  (updates: Partial<TabEditorState>) => {
    const tabId = tabs.activeTabId;
    if (!tabId) return;

    setTabEditorStates((prev) => ({
      ...prev,
      [tabId]: { ...prev[tabId], ...updates },
    }));
  },
  [tabs.activeTabId],
);

// エフェクトの代わりにイベントハンドラで更新関数を使用
const handleUrlChange = (newUrl: string) => {
  setUrl(newUrl);
  updateTabState({ url: newUrl });
};
```

## 3. 冗長なRef同期の削除

### 現在の問題: ref更新のための複数のuseEffect

### 推奨される解決策: setter内で直接refを更新

```typescript
// Before
const [methodState, setMethodState] = useState('GET');
const methodRef = useRef(methodState);
useEffect(() => {
  methodRef.current = methodState;
}, [methodState]);

// After
const [methodState, setMethodStateInternal] = useState('GET');
const methodRef = useRef(methodState);
const setMethodState = useCallback((value: string) => {
  setMethodStateInternal(value);
  methodRef.current = value; // refを即座に更新
}, []);
```

## 4. ダーティ状態トラッキングの最適化

### 現在の問題: 深い比較のためのJSON.stringify

### 推奨される解決策: 適切なメモ化と比較を使用

```typescript
// オプション1: ハッシュ関数を使用
import { hashObject } from 'object-hash';

const checkForChanges = useCallback(
  () => {
    const currentHash = hashObject({
      method: requestEditor.method,
      url: requestEditor.url,
      // ... その他のフィールド
    });

    if (currentHash !== initialHashRef.current) {
      markTabDirty(tabId);
    } else {
      markTabClean(tabId);
    }
  },
  [
    /* 依存関係 */
  ],
);

// オプション2: イミュータブル更新と比較のためにImmerを使用
import { produce } from 'immer';

const hasChanges = !Object.is(currentState, initialState);
```

## 5. グローバルWindow操作の置き換え

### 現在の問題: コンポーネント通信のためのwindowオブジェクトの使用

### 推奨される解決策: 適切なReactパターンを使用

```typescript
// オプション1: Context API
const TreeActionsContext = React.createContext<{
  onDelete: (nodeId: string) => void;
  onCopy: (nodeId: string) => void;
  // ... その他のアクション
}>(null);

// オプション2: イベントエミッターを持つカスタムフック
const useTreeActions = () => {
  const emitter = useEventEmitter();

  const handleAction = useCallback(
    (action: string, nodeId: string) => {
      emitter.emit('treeAction', { action, nodeId });
    },
    [emitter],
  );

  return { handleAction };
};
```

## 6. ストアサブスクリプションの簡素化

### 現在の問題: エフェクト内の手動サブスクリプション管理

### 推奨される解決策: Zustandの組み込みセレクターを使用

```typescript
// Before
React.useEffect(() => {
  const subscription = useFolderTreeStore.subscribe((state, prevState) => {
    if (state.treeState.focusedId !== prevState.treeState.focusedId) {
      // 変更を処理
    }
  });
  return () => subscription();
}, []);

// After - ZustandのsubscribeWithSelectorを使用
const focusedId = useFolderTreeStore(
  (state) => state.treeState.focusedId,
  shallow, // focusedIdが変更されたときのみ再レンダリング
);

useEffect(() => {
  if (focusedId && onFocusNode) {
    const mapping = getNodeMapping(focusedId);
    if (mapping) onFocusNode(mapping);
  }
}, [focusedId, onFocusNode]);
```

## 7. 変数抽出のリファクタリング

### 現在の問題: useEffect内の副作用

### 推奨される解決策: イベントハンドラを使用

```typescript
// レスポンスハンドラに移動
const handleApiResponse = useCallback(
  (response: ApiResponse) => {
    setResponse(response);

    // 変数抽出を即座に処理
    if (variableExtraction && tabs.activeTabId) {
      const results = extractVariablesFromResponse(response, variableExtraction);
      if (results.length > 0) {
        applyExtractedVariables(results);
      }
    }
  },
  [variableExtraction, tabs.activeTabId],
);
```

## 一般的な推奨事項

### 1. React 18の機能を使用

```typescript
// 外部状態にuseSyncExternalStoreを使用
const treeState = useSyncExternalStore(
  folderTreeStore.subscribe,
  folderTreeStore.getState,
  folderTreeStore.getServerSnapshot,
);
```

### 2. React Compilerの活用（利用可能になったら）

今後のReact Compilerは、コンポーネントとフックを自動的にメモ化し、手動最適化の必要性を減らします。

### 3. ステートマシンの検討

複雑な状態ロジックには、XStateまたは類似のものを検討してください：

```typescript
const tabMachine = createMachine({
  initial: 'idle',
  states: {
    idle: {},
    loading: {},
    dirty: {},
    saving: {},
  },
});
```

### 4. サーバー状態にReact Queryを使用

手動のAPI状態管理をReact Queryで置き換える：

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['request', requestId],
  queryFn: () => fetchRequest(requestId),
  staleTime: Infinity,
});
```

## 実装の優先順位

1. **高優先度**: 双方向同期パターンの修正（バグのリスクが高い）
2. **中優先度**: 冗長なref同期の削除（パフォーマンス改善）
3. **中優先度**: グローバルwindow操作の置き換え（保守性）
4. **低優先度**: ダーティトラッキングの最適化（パフォーマンス最適化）

## テスト戦略

リファクタリング前に：

1. 現在の動作に対する包括的なテストを追加
2. React Testing Libraryを使用してフックの動作をテスト
3. 複雑なフローに対する統合テストを追加
4. 変更前後のパフォーマンスをベンチマーク
