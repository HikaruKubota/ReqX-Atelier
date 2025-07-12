# useEffect 複雑性分析レポート

## 概要

App.tsx とその関連ファイルの調査により、無限ループやパフォーマンス問題を引き起こす可能性のある複雑な useEffect パターンが複数発見されました。

## 1. 特定された複雑な useEffect パターン

### 1.1 App.tsx の useEffect 一覧

1. **変数抽出 useEffect** (行 129-136)

   - 依存: `[response, variableExtraction, tabs.activeTabId]`
   - 問題: レスポンスが更新される度に実行される

2. **タブエディタ状態保存 useEffect** (行 209-236)

   - 依存: `[tabs.activeTabId, url, method, headers, requestNameForSave, variableExtraction]`
   - 問題: コメントアウトされた `currentBody` と `currentParams` が循環参照を引き起こしていた

3. **タブレスポンス同期 useEffect** (行 380-388)

   - 依存: `[response, error, responseTime, tabs.activeTabId]`
   - 問題: レスポンス状態の頻繁な更新

4. **タブ切り替え時レスポンス復元 useEffect** (行 390-402)

   - 依存: `[tabs.activeTabId]`
   - 問題: resetApiResponse の API が他の useEffect と競合する可能性

5. **最も複雑なタブ切り替え useEffect** (行 454-542)
   - 依存: `[tabs.activeTabId]`
   - 問題: 88行に及ぶ巨大な副作用、多数の状態更新、フラグ管理の複雑性

### 1.2 useUrlParamsSync の双方向同期 useEffect

1. **URL→Params 同期** (行 109-166)

   - 複数のフラグ (`isSyncingUrlToParamsRef`, `urlJustChangedRef`) で無限ループを防止
   - Promise.resolve() を使用した非同期フラグリセット

2. **Params→URL 同期** (行 169-210)
   - 同様に複雑なフラグ管理
   - 双方向同期による競合状態のリスク

### 1.3 その他の問題のあるパターン

- **useRequestEditor**: 8つの useEffect で ref と state の同期
- **useHeadersManager**: 複数の useEffect で ref の更新
- **useTabDirtyTracker**: JSON.stringify を使用した深い比較
- **RequestCollectionTreeV2**: グローバル window オブジェクトの操作

## 2. 無限ループリスクの高い箇所

### 2.1 タブエディタ状態保存 (App.tsx 行 209-236)

```typescript
// currentBody, currentParams をコメントアウト
// これらを依存配列に含めると無限ループが発生
```

### 2.2 URL/Params 双方向同期 (useUrlParamsSync)

- URL 変更 → Params 更新 → URL 再変更のループリスク
- 複雑なフラグ管理でかろうじて防止している状態

### 2.3 Ref 同期パターン

- state 更新 → useEffect → ref 更新 → 別の useEffect → state 更新の可能性

## 3. パフォーマンス問題

1. **頻繁な状態更新**

   - タブ切り替えごとに 10+ の setState 呼び出し
   - 各 setState が再レンダリングをトリガー

2. **重い計算**

   - JSON.stringify による深い比較（useTabDirtyTracker）
   - 大きなオブジェクトの頻繁なコピー

3. **メモリリーク**
   - クリーンアップ関数のない subscription（RequestCollectionTreeV2）

## 4. 改善提案

### 4.1 即座に実施可能な改善

1. **useEffect の統合**

   - 関連する複数の useEffect を 1 つに統合
   - 依存配列の最適化

2. **useMemo/useCallback の活用**

   - 計算結果のメモ化
   - コールバック関数の安定化

3. **状態管理の見直し**
   - 不要な状態の削除
   - 状態更新のバッチ化

### 4.2 中期的な改善

1. **カスタムフックへの分離**

   - 巨大な useEffect をより小さな専用フックに分割
   - 責務の明確化

2. **状態管理ライブラリの活用**

   - Zustand ストアへの移行検討
   - グローバル状態と ローカル状態の適切な分離

3. **React 18 機能の活用**
   - useSyncExternalStore の使用
   - startTransition による優先度制御

### 4.3 長期的な改善

1. **アーキテクチャの見直し**

   - タブ管理ロジックの完全な分離
   - イベント駆動アーキテクチャの採用

2. **テストの充実**
   - useEffect の副作用を検証するテスト
   - 無限ループ検出のための自動テスト

## 5. 優先順位

1. **最優先**: タブ切り替え useEffect (行 454-542) の分解
2. **高優先**: URL/Params 双方向同期の簡素化
3. **中優先**: Ref 同期パターンの削除
4. **低優先**: その他の小さな useEffect の最適化

## 次のステップ

1. このレポートを基に、具体的なリファクタリング計画を策定
2. 最も複雑な useEffect から段階的に改善を実施
3. 各改善後に回帰テストを実施して動作確認
