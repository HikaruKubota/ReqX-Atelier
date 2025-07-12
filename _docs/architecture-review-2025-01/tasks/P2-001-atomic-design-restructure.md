# P2-001: Atomic Design構造の是正

## 概要

現在のコンポーネント構造をAtomic Designパターンに正しく適合させ、再利用性と保守性を向上させる。

## 現状の問題点

- Atoms/Molecules/Organismsの分類が不適切
- Moleculesレイヤーがほぼ空（2個のみ）
- 複雑なコンポーネントがAtomsに配置されている
- 再利用可能なコンポーネントが不足

## 実装計画

### Step 1: 現状分析と移動計画

1. 既存コンポーネントの責務分析
2. 正しい階層への分類

```
移動対象:
- atoms/VariableTooltip.tsx → molecules/
- atoms/Modals/ → molecules/modals/
- 複雑なatomsの分解
```

### Step 2: 新規Moleculesの作成

1. RequestRow.tsx

   - Method Badge + URL Input + Action Buttons

2. HeaderRow.tsx

   - Key Input + Value Input + Delete Button

3. ResponseStatus.tsx

   - Status Code + Time + Size

4. TabItem.tsx

   - Icon + Title + Close Button

5. FormField.tsx
   - Label + Input + Error Message

### Step 3: 既存Atomsの整理

1. 純粋なUIコンポーネントのみ残す

   - Button
   - Input
   - Badge
   - Icon

2. 複雑なAtomsをMoleculesに昇格
3. スタイルの統一とテーマ対応

### Step 4: Organismsの見直し

1. 適切な粒度での分割
2. Moleculesの組み合わせによる構築
3. ビジネスロジックの適切な配置

### Step 5: Storybookの更新

1. 新しい構造に合わせてストーリーを再編成
2. コンポーネントカタログの作成
3. デザインシステムドキュメントの作成

### Step 6: 移行作業

1. import文の一括更新
2. 動作確認
3. 不要なコンポーネントの削除

## 完了条件

- [ ] Moleculesが15個以上存在
- [ ] 各階層の責務が明確に分離
- [ ] Storybookで全コンポーネントが確認可能
- [ ] コンポーネントの再利用率30%向上
- [ ] デザインシステムドキュメント完成

## 見積もり工数

4日（フルタイム換算）

## 依存関係

- P0, P1タスクの完了後が望ましい

## リスクと対策

- **リスク**: 大規模なファイル移動による混乱
  - **対策**: 段階的な移行とGitでの履歴保持
- **リスク**: import エラーの多発
  - **対策**: ESLintとTypeScriptによる自動検出
