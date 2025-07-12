# useEffect リファクタリング実装優先順位

## 実装順序の推奨

### 🚀 Phase 1: Ref同期パターンの削除（所要時間: 2-3時間）

**対象ファイル**: `useRequestEditor.ts`

**削除対象**:

- methodRef同期のuseEffect
- urlRef同期のuseEffect
- bodyRef同期のuseEffect
- paramsRef同期のuseEffect
- requestBodyRef同期のuseEffect
- queryStringRef同期のuseEffect
- requestNameForSaveRef同期のuseEffect
- activeRequestIdRef同期のuseEffect

**実装方法**:

1. useLatestカスタムフックを作成
2. 各refをuseLatestに置き換え
3. useEffectを削除

**リスク**: 最小（単純な置き換え）

---

### 🎯 Phase 2: 小さなuseEffectの統合（所要時間: 半日）

**対象**: App.tsx のタブレスポンス管理

**統合対象**:

- 行380-388: レスポンスの保存
- 行390-402: レスポンスの復元

**実装方法**:

```typescript
// 2つのuseEffectを1つに統合
useEffect(() => {
  const id = tabs.activeTabId;

  // 保存処理
  if (id && (response || error || responseTime)) {
    setTabResponses((prev) => ({
      ...prev,
      [id]: { response, error, responseTime },
    }));
  }

  // 復元処理
  if (id) {
    const saved = tabResponses[id];
    if (saved) {
      setApiResponseState(saved);
    } else {
      resetApiResponse();
    }
  } else {
    resetApiResponse();
  }
}, [tabs.activeTabId, response, error, responseTime]);
```

**リスク**: 低（関連処理の統合のみ）

---

### 🔧 Phase 3: タブエディタ状態保存の改善（所要時間: 1日）

**対象**: App.tsx 行209-236

**問題点**:

- currentBodyとcurrentParamsがコメントアウト（循環参照）
- 状態更新の非効率性

**実装方法**:

1. 各更新関数（updateTabUrl、updateTabParams等）内で直接状態を保存
2. useEffectを完全に削除
3. イベント駆動型に変更

**リスク**: 中（状態管理の変更）

---

### 🛠️ Phase 4: URL/Params同期の簡素化（所要時間: 1-2日）

**対象**: `useUrlParamsSync.ts`

**問題点**:

- 2つのuseEffectで双方向同期
- 複雑なフラグ管理（3つのref）
- 無限ループのリスク

**実装方法**:

1. 単一のuseEffectに統合
2. 前回値との比較で変更を検出
3. フラグ管理を削除

**リスク**: 中〜高（双方向同期の複雑性）

---

### 🚨 Phase 5: 巨大なタブ切り替えuseEffectの分解（所要時間: 2-3日）

**対象**: App.tsx 行454-542（88行）

**問題点**:

- 責務が多すぎる
- 条件分岐が複雑
- テストが困難

**実装方法**:

1. カスタムフック作成
   - useTabLoader
   - useTabStateManager
   - useTabSwitcher
2. 責務ごとに分解
3. React.startTransitionでバッチ更新

**リスク**: 高（アプリケーションの中核機能）

---

## 実装時の注意事項

### 各Phase共通

1. **必ずテストを実行**

   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

2. **コミット戦略**

   - 1つのPhaseごとにコミット
   - わかりやすいコミットメッセージ
   - 問題時のロールバックを考慮

3. **動作確認項目**
   - タブ切り替え
   - リクエスト送信
   - 保存/読み込み
   - URL/Params同期

### 段階的アプローチの利点

- リスクの最小化
- 進捗の可視化
- チームメンバーへの影響を最小限に
- 問題の早期発見

## 推奨開始ポイント

**Phase 1のRef同期パターンの削除から開始**

理由:

- 即座に効果が見える（8個のuseEffect削除）
- 実装が単純でリスクが低い
- チームの士気向上
- 後続の作業への自信につながる

## 期待される成果

| Phase | 削除されるuseEffect数 | コード削減量 | リスクレベル |
| ----- | --------------------- | ------------ | ------------ |
| 1     | 8個                   | 約24行       | 最小         |
| 2     | 1個（2→1に統合）      | 約10行       | 低           |
| 3     | 1個                   | 約20行       | 中           |
| 4     | 1個（2→1に統合）      | 約40行       | 中〜高       |
| 5     | 0個（分解のみ）       | 複雑性削減   | 高           |

**合計**: 11個のuseEffect削減、約100行のコード削減
