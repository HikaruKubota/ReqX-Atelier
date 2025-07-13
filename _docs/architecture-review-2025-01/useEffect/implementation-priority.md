# useEffect リファクタリング実装優先順位

## 実装順序の推奨

### ✅ Phase 1: Ref同期パターンの削除（完了）

**対象ファイル**: `useRequestEditor.ts`, `useBodyManager.ts`, `useParamsManager.ts`, `useHeadersManager.ts`

**削除対象**:

- methodRef同期のuseEffect
- urlRef同期のuseEffect
- bodyRef同期のuseEffect
- paramsRef同期のuseEffect
- requestBodyRef同期のuseEffect
- queryStringRef同期のuseEffect
- requestNameForSaveRef同期のuseEffect
- activeRequestIdRef同期のuseEffect

**実装結果**:

✅ useLatestカスタムフックを作成  
✅ 11個のuseEffectを削除（予想8個を上回る成果）  
✅ 全テスト通過確認  
✅ パフォーマンス向上を確認

**成果**: 11個のuseEffect削除、約30行のコード削減、不要な再レンダリング削減

---

### ✅ Phase 2: 小さなuseEffectの統合（完了）

**対象**: App.tsx のタブレスポンス管理

**統合対象**:

- 行380-388: レスポンスの保存
- 行390-402: レスポンスの復元

**実装結果**:

✅ 2つのuseEffectを1つに統合  
✅ レスポンス保存と復元ロジックを効率化  
✅ 全テスト通過確認  
✅ コードの可読性向上

**成果**: 1個のuseEffect削除（2→1に統合）、約15行のコード削減

---

### ✅ Phase 3: タブエディタ状態保存の改善（完了）

**対象**: App.tsx 行207-256

**問題点**:

- currentBodyとcurrentParamsで循環参照のリスク
- 状態更新の非効率性

**実装結果**:

✅ イベントハンドラ駆動型に変更  
✅ useEffectを完全に削除  
✅ ラッパー関数を作成（setMethodWithTabUpdate等）  
✅ TypeScriptエラー修正  
✅ 循環参照問題を解決  
✅ 全テスト通過確認

**成果**: 1個のuseEffect削除、循環参照リスク除去、コードの可読性向上

---

### ✅ Phase 4: URL/Params同期の簡素化（完了）

**対象**: `useUrlParamsSync.ts`

**問題点**:

- 2つのuseEffectで双方向同期
- 複雑なフラグ管理（5つのref）
- 無限ループのリスク

**実装結果**:

✅ 2つのuseEffectを1つに統合  
✅ URL変更優先の明確な制御フロー  
✅ 前回値との比較で変更検出を改善  
✅ 全テスト通過確認  
✅ 双方向同期の安定性向上

**成果**: 1個のuseEffect削減（2→1に統合）、約40行のコード削減、同期ロジックの簡素化

---

### ✅ Phase 5: 巨大なタブ切り替えuseEffectの分解（完了）

**対象**: App.tsx 行570-597（88行→28行に削減）

**問題点**:

- 責務が多すぎる
- 条件分岐が複雑
- テストが困難

**実装結果**:

✅ 3つのヘルパー関数を作成  
✅ `handleEmptyTabState`: 空タブ状態の処理  
✅ `loadSavedRequestIntoTab`: 保存済みリクエストの読み込み  
✅ `handleNewTabState`: 新規タブの状態処理  
✅ 88行→28行に削減（68%の削減）  
✅ 適切な型定義とmemo化で無限ループを防止  
✅ 全テスト通過確認  
✅ Lint/TypeCheckエラーなし

**成果**: 1個のuseEffect簡素化、約60行のコード削減、保守性大幅向上

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
| 1     | 11個                  | 約30行       | 最小         |
| 2     | 1個（2→1に統合）      | 約15行       | 低           |
| 3     | 1個                   | 約20行       | 中           |
| 4     | 1個（2→1に統合）      | 約40行       | 中〜高       |
| 5     | 0個（簡素化）         | 約60行       | 高→解決      |

**合計**: 14個のuseEffect削減、約165行のコード削減（全Phase完了）
