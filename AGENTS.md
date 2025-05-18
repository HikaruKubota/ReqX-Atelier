# AGENTS.md

## 概要

このドキュメントは、AIエージェント「Codex」がプロジェクト内でタスクを遂行するための役割、入力形式、期待される出力、制約条件などを明示したガイドラインです。CodexはDevinのように、自律的または半自律的にタスクをこなす開発支援エージェントです。

---

## エージェント情報

* **名前**: Codex
* **目的**: ソフトウェア開発タスクの自動化・補助
* **タスクの粒度**: 単体関数から仕様実装、テスト設計、ドキュメント生成、バグ修正など多岐にわたる
* **使用モデル例**: GPT-4, GPT-4 Turbo, Claude, Mistral など
* **実行環境**: Node.js / Python / Docker（必要に応じて環境準備済み）

---

## タスク分類とフォーマット

### 🔧 実装系タスク

* **例**: JWTトークンの検証ミドルウェアを追加せよ
* **入力例**:

```yaml
task_type: implementation
language: TypeScript
context: express.js API に対する認証レイヤーが存在しない
requirement: JWT を Authorization ヘッダーから取り出して検証するミドルウェアを追加
constraints: 他のmiddlewareに副作用を与えないこと
```

* **出力期待**:

  * 実装コード
  * 使用例（もしくは integration方法）
  * ユニットテスト（可能なら）

---

### 🧪 テスト系タスク

* **例**: `UserService` に対してユニットテストを追加
* **入力例**:

```yaml
task_type: testing
language: TypeScript
target_file: services/user.service.ts
coverage_goal: createUser, getUserById
testing_framework: Vitest
```

* **出力期待**:

  * テストファイル一式
  * モックやスタブの使用箇所明記
  * カバレッジ概要（可能なら）

---

### 📖 ドキュメント生成

* **例**: API仕様書を自動生成
* **入力例**:

```yaml
task_type: documentation
target: api/controllers/userController.ts
format: OpenAPI v3
include: エンドポイントの説明、パラメータ、レスポンス構造
```

* **出力期待**:

  * `.yaml` 形式の OpenAPI Spec
  * Markdown化された API 説明書（任意）

---

### 🛠 バグ調査・修正

* **例**: バグレポートを元に修正
* **入力例**:

```yaml
task_type: bugfix
bug_description: POST /users が 500 を返す（メールバリデーション時）
logs: |
  Error: Invalid email format at UserValidator
hypothesis: emailバリデーションに正規表現ミスがある
```

* **出力期待**:

  * 原因箇所の特定
  * 修正済みコード
  * 追加の再発防止テスト（任意）

---

## タスク命令の記述ガイド

1. 文脈をできるだけ明示的に記述
2. 「何をしてほしいか」と「何をしてはいけないか」の両方を書く
3. 必要に応じてファイルパス・コードブロック・制約条件を記載
4. タスクに名前（task\_idなど）を付けて管理すると拡張しやすい

---

## 補足

* Codexは複数タスクをキューで受け取り、並列ではなく逐次的に処理します（設定次第）
* タスク内で使用される外部ライブラリや環境がある場合、明示的にその指定を行ってください
* 自然言語だけでも動作しますが、YAML形式の命令構造を使うことで精度が上がります

---

## プロジェクト固有の指針

* 新しいUI文言を追加する際は `src/renderer/src/locales/en/translation.json` と `ja/translation.json` の両方を更新してください。
* テストコードは必ず作成しますが、ネットワーク制約により実行は任意とします。

---

## 更新履歴

| 日付         | 更新者      | 内容         |
| ---------- | -------- | ---------- |
| 2025-05-18 | hikaru K | Codex用初版作成 |
| 2025-05-18 | assistant | i18n更新とテスト方針追記 |
