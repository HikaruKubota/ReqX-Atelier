# 無限ループリスクの分析

## 概要

このドキュメントは、現在のコードベースにおける無限ループの潜在的なリスクを文書化し、それらを防ぐための戦略を提案します。

## 高リスクパターン

### 1. URL ↔ パラメータの双方向同期

**場所**: `src/renderer/src/hooks/useUrlParamsSync.ts`

**リスクシナリオ**:

```
1. URLが変更される
2. useEffect #1がトリガーされ、パラメータを更新
3. パラメータの変更がuseEffect #2をトリガー
4. useEffect #2がURLを更新
5. ステップ1に戻る（無限ループ）
```

**現在の防御策**:

- `isSyncingUrlToParamsRef`
- `isSyncingParamsToUrlRef`
- `urlJustChangedRef`
- `lastUrlRef`
- `lastParamsJsonRef`

**問題点**:

- 5つの異なるrefでフラグ管理
- タイミングに依存（Promise.resolve()）
- 複雑で理解しにくい

### 2. タブ状態の循環更新

**場所**: `src/renderer/src/App.tsx`

**リスクシナリオ**:

```typescript
// コメントに記載されている警告
// NOTE: Removing currentBody and currentParams from dependencies to avoid circular updates
useEffect(
  () => {
    // タブエディター状態を更新
  },
  [
    /* currentBody, currentParams を意図的に除外 */
  ],
);
```

**潜在的な問題**:

- 依存関係から値を除外することで、古い値を参照する可能性
- 完全な依存関係を含めると循環更新のリスク

### 3. 変数抽出の連鎖反応

**場所**: `src/renderer/src/App.tsx`

**リスクシナリオ**:

```
1. APIレスポンスを受信
2. 変数抽出エフェクトがトリガー
3. 抽出された変数が適用される（状態更新）
4. 状態更新が他のエフェクトをトリガー
5. 新しいAPIリクエストがトリガーされる可能性
```

## 中リスクパターン

### 4. ダーティ状態の過剰チェック

**場所**: `src/renderer/src/hooks/useTabDirtyTracker.ts`

**リスクシナリオ**:

- 7つの依存関係を持つuseEffect
- いずれかが変更されるたびにJSON.stringifyを実行
- パフォーマンス問題により、さらなる状態更新が遅延する可能性

### 5. フォルダーツリーの同期

**場所**: `src/renderer/src/hooks/useFolderTreeSync.ts`

**リスクシナリオ**:

- ツリー状態の変更がsavedRequestsStoreを更新
- savedRequestsStoreの更新がツリー状態を更新する可能性
- 双方向の依存関係

## 無限ループを防ぐための戦略

### 1. 単一方向のデータフロー

```typescript
// Bad: 双方向同期
useEffect(() => {
  /* A → B */
}, [A]);
useEffect(() => {
  /* B → A */
}, [B]);

// Good: 単一の真実の源
const [state, dispatch] = useReducer(reducer, initialState);
useEffect(() => {
  // 外部の変更のみを処理
}, [externalDependency]);
```

### 2. イベントベースの更新

```typescript
// Bad: エフェクトチェーン
useEffect(() => {
  setState(value);
}, [dependency]);

// Good: イベントハンドラで直接更新
const handleChange = (value) => {
  setState(value);
  // 必要な他の更新
};
```

### 3. バッチ更新

```typescript
// React 18の自動バッチングを活用
const handleUpdate = () => {
  // これらは自動的にバッチされる
  setUrl(newUrl);
  setParams(newParams);
  setHeaders(newHeaders);
};
```

### 4. デバウンス/スロットル

```typescript
const debouncedSync = useMemo(
  () =>
    debounce((url, params) => {
      // 同期ロジック
    }, 300),
  [],
);

useEffect(() => {
  debouncedSync(url, params);
}, [url, params]);
```

## 検出ツール

### 1. ESLintルール

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.name='useEffect'][arguments.0.body.body.length>10]",
        "message": "useEffectが複雑すぎます。リファクタリングを検討してください。"
      }
    ]
  }
}
```

### 2. カスタムフック for デバッグ

```typescript
const useEffectDebug = (effect, deps, name) => {
  const previousDeps = useRef(deps);

  useEffect(() => {
    const changedDeps = deps.filter((dep, i) => dep !== previousDeps.current[i]);
    if (changedDeps.length > 0) {
      console.log(`[${name}] 依存関係が変更されました:`, changedDeps);
    }
    previousDeps.current = deps;

    return effect();
  }, deps);
};
```

### 3. React DevToolsプロファイラー

- 過剰な再レンダリングを検出
- エフェクトの実行回数を監視
- パフォーマンスボトルネックを特定

## 推奨アクション

1. **即座の対応が必要**:

   - `useUrlParamsSync`の双方向同期を単一方向に変更
   - タブ状態管理の循環依存を解決

2. **短期的な改善**:

   - 複雑なuseEffectを小さな単位に分割
   - 依存配列の最適化
   - デバウンスの追加

3. **長期的な改善**:
   - ステートマシンの導入
   - イベント駆動アーキテクチャへの移行
   - React Queryなどの専用ライブラリの採用
