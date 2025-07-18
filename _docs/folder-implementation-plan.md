# フォルダ機能フルスクラッチ実装計画書

## 1. 概要

現在、ReqX-Atelierのフォルダ機能は`react-arborist`ライブラリを使用して実装されています。
この計画書では、VSCodeのエクスプローラーのようなフォルダ機能をフルスクラッチで実装するための詳細な計画を記載します。

## 2. 現在の実装状況

### 2.1 使用ライブラリ

- **react-arborist (v3.4.3)**: ツリーコンポーネントの主要ライブラリ
  - ツリー表示とナビゲーション
  - ドラッグ&ドロップサポート
  - キーボードナビゲーション
  - ノードの選択と編集
  - 仮想スクロール

### 2.2 主要ファイル

- `RequestCollectionTree.tsx`: メインのツリーコンポーネント
- `RequestCollectionSidebar.tsx`: サイドバーコンテナ
- `savedRequestsStore.ts`: フォルダとリクエストの状態管理

### 2.3 現在の機能

- 階層構造（フォルダ内にリクエストとサブフォルダを配置）
- ドラッグ&ドロップでの移動
- 右クリックメニューからの操作（コピー、削除、名前変更）
- キーボードナビゲーション
- 折り畳み/展開

## 3. VSCodeライクなフォルダ機能の要件定義

### 3.1 必須機能

1. **ツリー表示**

   - 階層的なフォルダ構造の表示
   - スムーズな折り畳み/展開アニメーション
   - インデントによる階層の視覚化
   - アイコン表示（フォルダ、リクエストタイプ別）

2. **インタラクション**

   - シングルクリックで選択
   - ダブルクリックで開く/折り畳み
   - 右クリックでコンテキストメニュー
   - ドラッグ&ドロップによる移動・並び替え

3. **キーボード操作**

   - 矢印キーでのナビゲーション（上下左右）
   - Enterキーで開く/折り畳み
   - F2キーで名前変更
   - Deleteキーで削除
   - Ctrl/Cmd+C/V/Xでコピー/ペースト/カット

4. **編集機能**

   - インライン名前変更
   - 新規フォルダ/リクエスト作成
   - 複数選択（Ctrl/Cmd+クリック、Shift+クリック）
   - 一括操作（削除、移動）

5. **検索とフィルタリング**
   - ツリー内検索
   - フィルタリング（名前、タイプ別）
   - 検索結果のハイライト

### 3.2 追加機能（VSCodeライク）

1. **ビジュアル**

   - ホバー時の背景色変更
   - 選択状態の明確な表示
   - フォーカス状態の表示
   - ドラッグ中のゴースト表示

2. **パフォーマンス**

   - 仮想スクロール（大量のアイテムに対応）
   - 遅延読み込み
   - メモ化による再レンダリング最適化

3. **アクセシビリティ**
   - ARIA属性の適切な設定
   - スクリーンリーダー対応
   - キーボードのみでの完全な操作

## 4. 技術的実装アプローチ

### 4.1 コンポーネント設計

```typescript
// ツリーコンポーネントの構造
-FolderTree(メインコンポーネント) -
  TreeNode(各ノードのコンポーネント) -
  NodeContent(ノードの内容表示) -
  NodeChildren(子ノードのコンテナ) -
  TreeContext(状態管理用コンテキスト) -
  TreeKeyboardHandler(キーボード操作) -
  TreeDragDropHandler(ドラッグ & ドロップ);
```

### 4.2 状態管理

```typescript
interface TreeState {
  nodes: Map<string, TreeNode>;
  expandedNodes: Set<string>;
  selectedNodes: Set<string>;
  focusedNode: string | null;
  editingNode: string | null;
  draggedNode: string | null;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'request';
  parentId: string | null;
  children: string[];
  metadata?: {
    method?: string;
    url?: string;
  };
}
```

### 4.3 主要な実装課題と解決策

1. **仮想スクロール**

   - react-window または @tanstack/react-virtual などの実績あるライブラリを活用
   - 可視領域のみをレンダリング
   - スクロール位置の計算とキャッシュ
   - ライブラリ選定基準：
     - ツリー構造のサポート
     - 動的な高さへの対応
     - TypeScript対応
     - メンテナンス状況

2. **ドラッグ&ドロップ**

   - HTML5 Drag and Drop APIの使用
   - ドロップ可能領域の計算
   - 循環参照の防止

3. **キーボードナビゲーション**

   - フォーカス管理（roving tabindex）
   - キーイベントの適切なハンドリング
   - アクセシビリティの考慮

4. **パフォーマンス最適化**
   - React.memo, useMemoの活用
   - 適切なキー設定
   - イベントデリゲーション

## 5. 実装フェーズ

### Phase 1: 基本機能（2週間）

- [ ] ツリー構造の表示
- [ ] 折り畳み/展開機能
- [ ] 選択機能
- [ ] 基本的なスタイリング

### Phase 2: インタラクション（2週間）

- [ ] キーボードナビゲーション
- [ ] 右クリックメニュー
- [ ] インライン編集
- [ ] 基本的なドラッグ&ドロップ

### Phase 3: 高度な機能（2週間）

- [ ] 複数選択
- [ ] 検索とフィルタリング
- [ ] 仮想スクロール
- [ ] パフォーマンス最適化

### Phase 4: 統合とテスト（1週間）

- [ ] 既存システムとの統合
- [ ] ユニットテスト
- [ ] E2Eテスト
- [ ] アクセシビリティテスト

## 6. 移行計画

### 6.1 段階的移行

1. 新しいフォルダコンポーネントを並行開発
2. フィーチャーフラグで切り替え可能に
3. 段階的にユーザーに展開
4. 問題がなければ完全移行

### 6.2 データ移行

- 既存のデータ構造は維持
- ストアの互換性を保つ
- 必要に応じてマイグレーション実装

## 7. テスト戦略

### 7.1 ユニットテスト

- 各コンポーネントの動作テスト
- 状態管理のテスト
- ユーティリティ関数のテスト

### 7.2 統合テスト

- ツリー全体の動作テスト
- ドラッグ&ドロップのテスト
- キーボード操作のテスト

### 7.3 E2Eテスト

- ユーザーシナリオのテスト
- パフォーマンステスト
- アクセシビリティテスト

## 8. リスクと対策

### 8.1 技術的リスク

- **複雑性**: VSCodeレベルの機能は実装が複雑
  - 対策: MVPから始めて段階的に機能追加
- **パフォーマンス**: 大量のノードでの性能問題
  - 対策: 仮想スクロールと最適化の徹底
- **ブラウザ互換性**: ドラッグ&ドロップの挙動の違い
  - 対策: 十分なテストと代替実装の準備

### 8.2 プロジェクトリスク

- **工数超過**: 想定以上の実装時間
  - 対策: 優先順位を明確にし、必須機能から実装
- **既存機能への影響**: 移行時の不具合
  - 対策: フィーチャーフラグと段階的移行

## 9. 参考実装

### 9.1 参考にすべきOSSプロジェクト

- VSCode (Microsoft)
- react-complex-tree
- rc-tree (Ant Design)
- Arco Design Tree

### 9.2 デザインパターン

- Composite Pattern (ツリー構造)
- Observer Pattern (状態管理)
- Strategy Pattern (操作の切り替え)

## 10. まとめ

このフルスクラッチ実装により、以下のメリットが期待できます：

- 完全なカスタマイズ性
- ライブラリ依存の削減
- VSCodeライクな高度なUX
- パフォーマンスの最適化

実装には約7週間を見込んでいますが、段階的にリリースすることで、リスクを最小限に抑えながら進めることができます。
