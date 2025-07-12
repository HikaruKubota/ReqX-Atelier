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

**合計**: 13個のuseEffect削減、約70行のコード削減（Phase 3まで完了）
