# Controlled Components Refactoring Plan

## 概要

タブ切り替え時のデータ混在問題を根本的に解決するため、BodyEditorKeyValueを完全に制御されたコンポーネントに変更する。

## 現在の問題

- BodyEditorKeyValueが内部状態を持っているため、initialBodyとの同期が複雑
- タブ切り替え時の初期化タイミングが不明確
- 状態管理の責任範囲が曖昧

## 実装方針

### Phase 1: 状態管理の集約

1. **useRequestEditorの拡張**

   - body状態の直接管理
   - params状態の直接管理
   - タブごとの状態分離

2. **BodyEditorKeyValueのリファクタリング**
   - 内部状態（useState）を削除
   - value/onChangeパターンへの変更
   - 純粋な表示コンポーネント化

### Phase 2: データフローの整理

1. **明確な単一方向データフロー**

   ```
   App.tsx
     ↓ (activeTabId)
   useRequestEditor
     ↓ (body, params)
   RequestEditorPanel
     ↓ (value, onChange)
   BodyEditorKeyValue / ParamsEditorKeyValue
   ```

2. **タブ切り替え時の処理**
   - activeTabIdの変更を検知
   - 対応するタブのデータを読み込み
   - 明示的な状態更新

### Phase 3: テストとバリデーション

1. **ユニットテスト**

   - 制御されたコンポーネントとしての動作確認
   - タブ切り替え時の状態管理

2. **統合テスト**
   - 複数タブでの編集
   - データの保持と切り替え

## 実装手順

### Step 1: useRequestEditorの拡張

```typescript
// タブごとの状態を管理
interface TabState {
  body: KeyValuePair[];
  params: KeyValuePair[];
  // ... other fields
}

const [tabStates, setTabStates] = useState<Record<string, TabState>>({});
```

### Step 2: BodyEditorKeyValueの変更

```typescript
interface BodyEditorKeyValueProps {
  value: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  method: string;
  // ... other props
}

// 内部でuseStateを使わない
export const BodyEditorKeyValue: React.FC<BodyEditorKeyValueProps> = ({
  value,
  onChange,
  method,
  // ...
}) => {
  // 状態管理はせず、propsのみで動作
};
```

### Step 3: データフローの接続

- useRequestEditorでタブごとの状態を管理
- activeTabIdに基づいて適切なデータを渡す
- 変更はすべて上位層で処理

## 期待される効果

1. **明確な責任分離**

   - 状態管理: useRequestEditor
   - 表示・編集UI: BodyEditorKeyValue

2. **予測可能な動作**

   - タブ切り替え時の動作が明確
   - データの同期問題が解消

3. **テスタビリティの向上**
   - 純粋なコンポーネントとしてテスト可能
   - 状態管理のテストが分離

## リスクと対策

1. **大規模な変更**

   - 段階的な実装で影響を最小化
   - 十分なテストで品質を担保

2. **パフォーマンス**
   - メモ化の適切な使用
   - 不要な再レンダリングの防止

## スケジュール

- Phase 1: 2-3日
- Phase 2: 1-2日
- Phase 3: 1日

## 成功指標

- タブ切り替え時のデータ混在が発生しない
- ユーザーの編集内容が適切に保持される
- コードの可読性と保守性が向上
