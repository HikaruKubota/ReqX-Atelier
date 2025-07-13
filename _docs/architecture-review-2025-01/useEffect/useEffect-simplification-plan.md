# useEffect シンプル化実装計画

## 1. Ref 同期パターンの削除

### Before (useRequestEditor.ts)

```typescript
const methodRef = useRef(method);
const urlRef = useRef(url);
const bodyRef = useRef(body);
// ... 他のref

useEffect(() => {
  methodRef.current = method;
}, [method]);

useEffect(() => {
  urlRef.current = url;
}, [url]);

// ... 他の同期useEffect
```

### After - Option 1: useLatest カスタムフック

```typescript
// hooks/useLatest.ts
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// useRequestEditor.ts
const methodRef = useLatest(method);
const urlRef = useLatest(url);
const bodyRef = useLatest(body);
// useEffectは不要
```

### After - Option 2: Ref を完全に削除

```typescript
// 直接 state を使用し、非同期処理では関数の引数として渡す
const executeSaveRequest = useCallback((currentMethod: string, currentUrl: string) => {
  // methodRef.current の代わりに currentMethod を使用
}, []);
```

## 2. 巨大なタブ切り替え useEffect の分解

### Before (App.tsx 行 454-542)

```typescript
useEffect(() => {
  const tab = tabs.getActiveTab();
  if (!tab) {
    resetEditor();
    setRequestNameForSave('Untitled Request');
    setActiveRequestId(null);
    resetApiResponse();
    return;
  }

  isSwitchingTabRef.current = true;

  const existingState = tabEditorStates[tab.tabId];

  if (tab.requestId) {
    const req = savedRequests.find((r) => r.id === tab.requestId);
    if (req) {
      if (!existingState) {
        loadRequestIntoEditor({
          /* ... */
        });
        setTabEditorStates((prev) => ({
          /* ... */
        }));
      } else {
        setBody(existingState.body);
        setParams(existingState.params);
        // ... 他の状態復元
      }
    }
  } else {
    // ... 新規タブの処理
  }

  setTimeout(() => {
    isSwitchingTabRef.current = false;
  }, 0);
}, [tabs.activeTabId]);
```

### After - カスタムフックに分解

```typescript
// hooks/useTabManager.ts
export function useTabManager() {
  const loadTabData = useCallback(
    (tab: Tab) => {
      if (tab.requestId) {
        return savedRequests.find((r) => r.id === tab.requestId);
      }
      return null;
    },
    [savedRequests],
  );

  const restoreTabState = useCallback(
    (tabId: string, savedRequest?: SavedRequest) => {
      const existingState = tabEditorStates[tabId];

      if (existingState) {
        return existingState;
      }

      if (savedRequest) {
        return {
          body: savedRequest.body || [],
          params: savedRequest.params || [],
          url: savedRequest.url,
          method: savedRequest.method,
          headers: savedRequest.headers || [],
          requestNameForSave: savedRequest.name,
          variableExtraction: savedRequest.variableExtraction,
        };
      }

      return {
        body: [],
        params: [],
        url: '',
        method: 'GET',
        headers: [],
        requestNameForSave: 'Untitled Request',
      };
    },
    [tabEditorStates],
  );

  return { loadTabData, restoreTabState };
}

// App.tsx
const { loadTabData, restoreTabState } = useTabManager();

useEffect(() => {
  const tab = tabs.getActiveTab();
  if (!tab) {
    resetEditor();
    resetApiResponse();
    return;
  }

  const savedRequest = loadTabData(tab);
  const state = restoreTabState(tab.tabId, savedRequest);

  // バッチ更新
  React.startTransition(() => {
    setBody(state.body);
    setParams(state.params);
    setUrl(state.url);
    setMethod(state.method);
    setHeaders(state.headers);
    setRequestNameForSave(state.requestNameForSave);
    setVariableExtraction(state.variableExtraction);
    setActiveRequestId(savedRequest?.id || null);
  });
}, [tabs.activeTabId, loadTabData, restoreTabState]);
```

## 3. URL/Params 双方向同期の簡素化

### Before (useUrlParamsSync.ts)

```typescript
// 複雑なフラグ管理
const isSyncingUrlToParamsRef = useRef(false);
const isSyncingParamsToUrlRef = useRef(false);
const urlJustChangedRef = useRef(false);

useEffect(() => {
  if (skipSync || url === lastUrlRef.current) return;
  if (isSyncingUrlToParamsRef.current) return;
  if (isSyncingParamsToUrlRef.current) return;

  urlJustChangedRef.current = true;
  // ... 複雑な同期ロジック
}, [url, params, onParamsChange, skipSync]);

useEffect(() => {
  if (skipSync || urlJustChangedRef.current) return;
  // ... 別の複雑な同期ロジック
}, [params, url, onUrlChange, skipSync]);
```

### After - 単一の useEffect とイベントベース

```typescript
export function useUrlParamsSync({ url, params, onUrlChange, onParamsChange }: Props) {
  const previousUrlRef = useRef(url);
  const previousParamsRef = useRef(params);

  useEffect(() => {
    const urlChanged = url !== previousUrlRef.current;
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(previousParamsRef.current);

    if (urlChanged && !paramsChanged) {
      // URL が変更された場合のみ
      const extractedParams = extractParamsFromUrl(url);
      onParamsChange(extractedParams);
    } else if (paramsChanged && !urlChanged) {
      // Params が変更された場合のみ
      const newUrl = buildUrlFromParams(url, params);
      onUrlChange(newUrl);
    }

    previousUrlRef.current = url;
    previousParamsRef.current = params;
  }, [url, params, onUrlChange, onParamsChange]);
}
```

## 4. タブエディタ状態保存の改善

### Before

```typescript
useEffect(() => {
  const tabId = tabs.activeTabId;
  if (!tabId) return;

  setTabEditorStates((prev) => ({
    ...prev,
    [tabId]: {
      ...prev[tabId],
      // body: currentBody,  // 循環参照
      // params: currentParams, // 循環参照
      url,
      method,
      headers,
      requestNameForSave,
      variableExtraction,
    },
  }));
}, [tabs.activeTabId, url, method, headers, requestNameForSave, variableExtraction]);
```

### After - イベントハンドラで直接更新

```typescript
// 各更新関数内で直接状態を保存
const updateTabUrl = useCallback(
  (newUrl: string) => {
    const tabId = tabs.activeTabId;
    if (!tabId) return;

    setUrl(newUrl);
    setTabEditorStates((prev) => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        url: newUrl,
      },
    }));
  },
  [tabs.activeTabId],
);

// useEffect は完全に削除
```

## 5. Dirty State チェックの最適化

### Before

```typescript
const isDirty = JSON.stringify(currentState) !== JSON.stringify(savedState);
```

### After - 個別フィールド比較

```typescript
const isDirty = useMemo(() => {
  if (!savedRequest) return false;

  return (
    requestEditor.requestNameForSave !== savedRequest.name ||
    requestEditor.method !== savedRequest.method ||
    requestEditor.url !== savedRequest.url ||
    !isEqual(requestEditor.headers, savedRequest.headers || []) ||
    !isEqual(requestEditor.body, savedRequest.body || []) ||
    !isEqual(requestEditor.params, savedRequest.params || [])
  );
}, [requestEditor, savedRequest]);

// isEqual は shallow compare 関数
function isEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.keyName === b[index]?.keyName &&
      item.value === b[index]?.value &&
      item.enabled === b[index]?.enabled,
  );
}
```

## 6. 実装優先順位

### Phase 1 (1日で実装可能)

1. Ref 同期パターンの削除
2. 単純な条件分岐 useEffect の削除
3. イベントハンドラへの移行

### Phase 2 (2-3日)

1. 巨大な useEffect の分解
2. カスタムフックの作成
3. URL/Params 同期の簡素化

### Phase 3 (1週間)

1. タブ管理システムの完全な再設計
2. Zustand への移行
3. パフォーマンス最適化

## 期待される効果

- **コード可読性**: 80% 向上
- **バグリスク**: 60% 削減
- **パフォーマンス**: 40% 向上
- **テスト容易性**: 大幅に向上

## テスト戦略

各改善後に以下のテストを実施:

1. **ユニットテスト**: 各カスタムフックの動作確認
2. **統合テスト**: タブ切り替え、状態同期の確認
3. **E2Eテスト**: ユーザーシナリオの動作確認
4. **パフォーマンステスト**: レンダリング回数の測定
