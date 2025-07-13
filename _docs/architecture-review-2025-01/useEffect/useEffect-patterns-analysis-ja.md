# useEffectパターン分析

## 概要

このドキュメントは、ReqX-Atelierのコードベースで見つかった複雑なuseEffectパターンを分析します。これらのパターンは、パフォーマンス問題、無限ループ、保守性の問題を引き起こす可能性があります。

## 1. 双方向同期パターン

### 場所: `src/renderer/src/hooks/useUrlParamsSync.ts`

**パターン**: URL ↔ パラメータを双方向で同期する2つの別々のuseEffect

```typescript
// URLの変更をパラメータに同期
useEffect(() => {
  if (skipSync) return;
  if (url === lastUrlRef.current) return;
  // ... 複数のフラグを使った複雑な同期ロジック
}, [url, params, onParamsChange, skipSync]);

// パラメータの変更をURLに同期
useEffect(() => {
  if (skipSync) return;
  if (urlJustChangedRef.current) return;
  // ... 複数のフラグを使った複雑な同期ロジック
}, [params, url, onUrlChange, skipSync]);
```

**問題点**:

- 無限ループを防ぐために複数のrefをフラグとして使用
- Promise.resolve()による複雑なタイミング依存
- 実行順序の推論が困難
- レースコンディションのリスクが高い

**依存配列**: 各エフェクトに4-5個の依存関係（同期する両方の値を含む）

## 2. 複数状態のタブ管理

### 場所: `src/renderer/src/App.tsx`

**パターン**: 重複する関心事を持つ複数のuseEffectでタブ状態を管理

```typescript
// エディタの値が変更されたときに現在のタブ状態を保存
useEffect(() => {
  const tabId = tabs.activeTabId;
  if (!tabId) return;

  setTabEditorStates((prev) => ({
    ...prev,
    [tabId]: {
      ...prev[tabId],
      url,
      method,
      headers,
      requestNameForSave,
      variableExtraction,
    },
  }));
}, [tabs.activeTabId, url, method, headers, requestNameForSave, variableExtraction]);
```

**問題点**:

- 単一のエフェクトに6個以上の依存関係
- 他のエフェクトをトリガーする可能性のある状態更新
- 循環更新に関するコメントアウトされた警告
- 複雑な状態導出ロジック

## 3. 冗長なRef同期

### 場所: `src/renderer/src/hooks/useRequestEditor.ts`

**パターン**: 状態とrefを同期させるためだけの複数のuseEffect

```typescript
useEffect(() => {
  methodRef.current = methodState;
}, [methodState]);

useEffect(() => {
  urlRef.current = urlState;
}, [urlState]);

useEffect(() => {
  requestNameForSaveRef.current = requestNameForSaveState;
}, [requestNameForSaveState]);
```

**問題点**:

- 単純なref更新のための不要なエフェクト
- setter関数内で処理可能
- 追加のレンダリングサイクルを作成
- 複数のフックで繰り返されるパターン

## 4. ダーティトラッキングのための深いオブジェクト比較

### 場所: `src/renderer/src/hooks/useTabDirtyTracker.ts`

**パターン**: useEffect内でJSON.stringifyを使用した深い等価性チェック

```typescript
useEffect(() => {
  if (!initialValuesRef.current) return;

  checkForChanges();
}, [
  requestEditor.method,
  requestEditor.url,
  requestEditor.requestNameForSave,
  requestEditor.headers,
  requestEditor.body,
  requestEditor.params,
  tabId,
]);

// checkForChanges内部:
const hasChanged = JSON.stringify(currentValues) !== JSON.stringify(initialValuesRef.current);
```

**問題点**:

- 依存関係が変更されるたびに高コストなJSON.stringify操作
- 大きな依存配列（7個以上の項目）
- 大規模なデータセットでのパフォーマンス問題の可能性
- 順序に依存する比較

## 5. グローバルWindowオブジェクトの操作

### 場所: `src/renderer/src/components/FolderTree/RequestCollectionTreeV2.tsx`

**パターン**: windowオブジェクトにハンドラーをアタッチするためのエフェクト使用

```typescript
React.useEffect(() => {
  const handleContextAction = (action: string, nodeId: string) => {
    // ... ハンドラーロジック
  };

  (
    window as unknown as { __folderTreeContextAction?: typeof handleContextAction }
  ).__folderTreeContextAction = handleContextAction;
}, [onDeleteRequest, onDeleteFolder, onCopyRequest, onCopyFolder, onAddFolder, onAddRequest]);
```

**問題点**:

- グローバルオブジェクトへの副作用
- windowプロパティのクリーンアップなし
- メモリリークの可能性
- Reactコンポーネント通信のアンチパターン

## 6. ストアサブスクリプションエフェクト

### 場所: `src/renderer/src/components/FolderTree/RequestCollectionTreeV2.tsx`

**パターン**: useEffect内でZustandストアの変更をサブスクライブ

```typescript
React.useEffect(() => {
  if (!onFocusNode) return;

  const subscription = useFolderTreeStore.subscribe((state, prevState) => {
    if (state.treeState.focusedId !== prevState.treeState.focusedId && state.treeState.focusedId) {
      // ... コールバックロジック
    }
  });

  return () => subscription();
}, [onFocusNode]);
```

**問題点**:

- 他の依存関係が変更された場合、コールバックが古くなる可能性
- 手動のサブスクリプション管理
- 更新の見逃しやメモリリークの可能性

## 7. 変数抽出チェーン

### 場所: `src/renderer/src/App.tsx`

**パターン**: レスポンスを受信したときに変数抽出をトリガーするエフェクト

```typescript
React.useEffect(() => {
  if (response && variableExtraction && tabs.activeTabId) {
    const results = extractVariablesFromResponse(response, variableExtraction);
    if (results.length > 0) {
      applyExtractedVariables(results);
    }
  }
}, [response, variableExtraction, tabs.activeTabId]);
```

**問題点**:

- 外部状態を変更する副作用（applyExtractedVariables）
- 依存関係の欠落（extractVariablesFromResponse、applyExtractedVariables）
- 追加のレンダリングとエフェクトをトリガーする可能性

## まとめ

コードベースは複雑性を増加させるいくつかのパターンを示しています：

1. 単純な操作に対する**useEffectへの過度の依存**
2. 無限ループを防ぐための**複雑なフラグ管理**
3. エフェクトの推論を困難にする**大きな依存配列**
4. 潜在的なバグにつながる**欠落または不正確な依存関係**
5. エフェクト内の**高コストな操作**（JSON.stringify）
6. 通信メカニズムとしての**グローバル状態操作**

これらのパターンにより、コードの保守、デバッグ、最適化が困難になっています。推奨される改善については`refactoring-recommendations-ja.md`を参照してください。
