# Controlled Components Direct Implementation Plan

## 概要

タブ切り替え時のデータ混在問題を根本的に解決するため、既存のコンポーネントを段階的に制御されたコンポーネントに変更する。

## 実装方針

### Step 1: BodyEditorKeyValue の制御化

1. 現在の `BodyEditorKeyValue` を内部状態を持たない制御されたコンポーネントに変更
2. `initialBody` を `value` に変更
3. 状態管理を親コンポーネントに移動

### Step 2: RequestEditorPanel の更新

1. body と params の状態を管理
2. 子コンポーネントに value/onChange として渡す

### Step 3: useRequestEditor の拡張

1. タブごとの状態管理を実装
2. activeTabId に基づく状態の切り替え

### Step 4: App.tsx の調整

1. タブ切り替え時の状態管理を明確化
2. データフローの整理

## 段階的実装

各ステップを小さなコミットで実装し、既存の機能を壊さないように注意する。

## 期待される効果

- タブ切り替え時のデータ混在が解消
- 状態管理が明確になる
- テストが容易になる
