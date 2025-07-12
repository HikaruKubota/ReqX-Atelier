解決済みのはず。

# Issue: タブ切り替え時のデータ混在問題

## 概要

タブを切り替えた際に、稀に別のタブのbodyやパラメータが表示されてしまう問題が発生しています。

## 現象

- 100%再現するわけではない
- 特に値を持っていないリクエストで発生しやすい
- 以前の値を参照しているような動作をする

## 問題の根本原因

コンポーネントの状態管理の責任範囲が不明確なことにある：

1. **現在の構造**

   - `App.tsx` - タブ管理、リクエストの読み込み
   - `useRequestEditor` - エディタ全体の状態管理
   - `BodyEditorKeyValue` - body部分の表示と編集

2. **設計上の問題**
   - `BodyEditorKeyValue`が「受動的」（initialBodyを受け取って表示）と「能動的」（ユーザーの編集を管理）の両方の役割を持っている
   - このため、「いつ初期化すべきか」の判断が困難

## 暫定的な対策

以下の修正を実施済み：

1. `BodyEditorKeyValue`の初期化ロジックを改善
2. `App.tsx`のuseEffectの依存配列を調整
3. `useRequestEditor`の依存配列を簡素化

## 根本的な解決案

以下のいずれかのアプローチが必要：

### 案1: 完全な制御反転

- `BodyEditorKeyValue`を完全に制御されたコンポーネントにする
- 状態管理をすべて上位層（`useRequestEditor`）に移動
- メリット：データフローが明確になる
- デメリット：大規模なリファクタリングが必要

### 案2: 明示的な初期化制御

- タブ切り替えを明示的に検知する仕組みを追加
- `resetOnTabChange`のようなプロパティを追加
- メリット：現在の構造を大きく変えずに実装可能
- デメリット：一時的な解決策になる可能性

### 案3: コンポーネントの責務分離

- 表示用と編集用のコンポーネントに分離
- 状態管理用のカスタムフックを作成
- メリット：責務が明確になる
- デメリット：コンポーネントが増える

## 推奨される次のステップ

1. 問題の再現手順を確立する
2. E2Eテストで再現可能なテストケースを作成
3. 上記の解決案から最適なものを選択し、実装する

## 関連ファイル

- `/src/renderer/src/components/BodyEditorKeyValue.tsx`
- `/src/renderer/src/hooks/useRequestEditor.ts`
- `/src/renderer/src/App.tsx`
- `/src/renderer/src/hooks/useBodyManager.ts`
- `/src/renderer/src/hooks/useParamsManager.ts`
