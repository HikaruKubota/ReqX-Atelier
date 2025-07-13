# useEffect 削除・簡素化候補リスト

## 1. 即座に削除可能な useEffect

### 1.1 Ref 同期のみの useEffect (useRequestEditor.ts)

以下の useEffect は state と ref の同期のみを行っており、削除可能:

```typescript
// methodRef の同期 (行 101-103)
useEffect(() => {
  methodRef.current = method;
}, [method]);

// urlRef の同期 (行 105-107)
useEffect(() => {
  urlRef.current = url;
}, [url]);

// その他 6 つの同様のパターン
```

**解決策**: useRef の代わりに useLatest カスタムフックを使用、または ref を完全に削除

### 1.2 単純な条件分岐の useEffect

```typescript
// ResponseDisplayPanel.tsx (行 37-47)
useEffect(() => {
  if (response) {
    setActiveTab('body');
  }
}, [response]);
```

**解決策**: レンダリング時の条件分岐に変更

## 2. 統合可能な useEffect

### 2.1 タブレスポンス管理 (App.tsx)

現在分離されている 2 つの useEffect:

```typescript
// 行 380-388: レスポンスの保存
useEffect(() => {
  const id = tabs.activeTabId;
  if (!id) return;
  setTabResponses((prev) => ({
    ...prev,
    [id]: { response, error, responseTime },
  }));
}, [response, error, responseTime, tabs.activeTabId]);

// 行 390-402: レスポンスの復元
useEffect(() => {
  const id = tabs.activeTabId;
  if (!id) {
    resetApiResponse();
    return;
  }
  const saved = tabResponses[id];
  if (saved) {
    setApiResponseState(saved);
  } else {
    resetApiResponse();
  }
}, [tabs.activeTabId]);
```

**解決策**: 単一の useEffect に統合、または Zustand ストアで管理

### 2.2 URL/Params 同期 (useUrlParamsSync.ts)

2 つの複雑な useEffect を 1 つに統合可能

## 3. 簡素化可能な useEffect

### 3.1 巨大なタブ切り替え useEffect (App.tsx 行 454-542)

88行の巨大な useEffect を以下に分割:

1. **タブデータの読み込み** (カスタムフックへ)
2. **エディタ状態の初期化** (カスタムフックへ)
3. **フラグ管理** (不要、状態管理で解決)

### 3.2 タブエディタ状態保存 (App.tsx 行 209-236)

循環参照を避けるための複雑な実装を簡素化:

```typescript
// 現在のコード（コメントアウトあり）
useEffect(() => {
  const tabId = tabs.activeTabId;
  if (!tabId) return;

  setTabEditorStates((prev) => ({
    ...prev,
    [tabId]: {
      ...prev[tabId],
      // body: currentBody,  // 循環参照のため削除
      // params: currentParams, // 循環参照のため削除
      url,
      method,
      headers,
      requestNameForSave,
      variableExtraction,
    },
  }));
}, [tabs.activeTabId, url, method, headers, requestNameForSave, variableExtraction]);
```

**解決策**: イベントハンドラで直接状態を更新

## 4. パフォーマンス改善が必要な useEffect

### 4.1 Dirty State チェック (useTabDirtyTracker.ts)

```typescript
useEffect(() => {
  const savedRequest = savedRequests.find((r) => r.id === requestEditor.activeRequestId);
  if (!savedRequest) return;

  const currentState = {
    name: requestEditor.requestNameForSave,
    method: requestEditor.method,
    url: requestEditor.url,
    headers: requestEditor.headers,
    body: requestEditor.body,
    params: requestEditor.params,
  };

  const savedState = {
    name: savedRequest.name,
    method: savedRequest.method,
    url: savedRequest.url,
    headers: savedRequest.headers || [],
    body: savedRequest.body || [],
    params: savedRequest.params || [],
  };

  const isDirty = JSON.stringify(currentState) !== JSON.stringify(savedState);
  // ...
});
```

**問題**: JSON.stringify による重い計算
**解決策**: 個別フィールドの比較、または Immer を使用

## 5. 削除の優先順位

### 高優先度（すぐに削除可能）

1. Ref 同期のみの useEffect (8個)
2. 単純な条件分岐の useEffect (3個)

### 中優先度（リファクタリング後に削除）

1. タブレスポンス管理の統合
2. URL/Params 同期の簡素化
3. Window イベントリスナーの最適化

### 低優先度（アーキテクチャ変更後）

1. 巨大なタブ切り替えロジック
2. Dirty State の完全な見直し

## 6. 実装計画

### Phase 1: 即座に実施（1日）

- Ref 同期 useEffect の削除
- 単純な条件分岐の削除
- 小さな useEffect の統合

### Phase 2: リファクタリング（2-3日）

- カスタムフックへの分離
- 状態管理の最適化
- パフォーマンス改善

### Phase 3: アーキテクチャ改善（1週間）

- タブ管理システムの再設計
- Zustand ストアへの移行
- イベント駆動への変更

## 推定削減効果

- **useEffect の数**: 現在 30+ → 目標 10以下
- **コード行数**: 約 40% 削減
- **レンダリング回数**: 約 60% 削減
- **保守性**: 大幅に向上
