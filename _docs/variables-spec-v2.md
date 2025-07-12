# ReqX-Atelier 変数機能仕様書 v2.1

## 概要

API開発において、環境（開発・ステージング・本番）やエンドポイント、認証情報などを効率的に管理できる変数機能を提供します。シンプルで分かりやすい2レベルスコープ設計により、変数の定義場所を明確にし、ユーザーの混乱を防ぎます。

## 基本コンセプト

### 1. シンプルな2レベルスコープ設計

- **Global Level（グローバルレベル）🌍**: 全環境共通の変数
- **Environment Level（環境レベル）🌐**: 特定環境専用の変数
- **明確な優先順位**: Environment Level が Global Level を上書き

### 2. 環境切り替えの簡単さ

- **環境プリセット**: development, staging, production の3つの環境を標準提供
- **ワンクリック切り替え**: ツールバーから環境を瞬時に切り替え
- **カスタム環境**: ユーザー独自の環境も追加可能

### 3. 直感的な変数参照

- **${変数名}構文**: 馴染みのある構文で変数を参照
- **インライン表示**: 変数が解決された値をツールチップで表示
- **自動補完**: 入力時に利用可能な変数をサジェスト

## 機能詳細

### A. 環境管理機能

#### A-1. 環境選択UI

```
ツールバー右上に環境選択ドロップダウンを配置
[🌐 Environment: Development ▼]
```

**選択肢:**

- Development（開発環境）
- Staging（ステージング環境）
- Production（本番環境）
- Custom...（カスタム環境追加）

#### A-2. 変数セットの構成

各環境は独立した変数セットを持ち、さらにGlobal変数を参照できる：

```javascript
// Global Variables (全環境共通)
global: {
  appName: "ReqX-Atelier",
  apiVersion: "v1",
  defaultTimeout: "30000",
  userAgent: "ReqX-Atelier/1.0"
}

// Environment Variables (環境固有)
environments: {
  development: {
    baseUrl: "https://api-dev.example.com",
    apiKey: "dev-key-123",
    timeout: "5000"  // Global の defaultTimeout を上書き
  },
  staging: {
    baseUrl: "https://api-staging.example.com",
    apiKey: "staging-key-456",
    timeout: "10000"  // Global の defaultTimeout を上書き
  },
  production: {
    baseUrl: "https://api.example.com",
    apiKey: "prod-key-789"
    // timeout は指定なし → Global の defaultTimeout (30000) を使用
  }
}
```

### B. 変数管理パネル

#### B-1. アクセス方法

- **メインメニュー**: View → Variables（またはCtrl/Cmd + Shift + V）
- **ツールバー**: 変数アイコンボタン `{x}`
- **右クリックメニュー**: フォルダ右クリック → "Manage Variables"

#### B-2. パネルレイアウト（シンプル設計）

```
┌─────────────────────────────────────┐
│ Variables - Development Environment │
├─────────────────────────────────────┤
│ 🔍 Search all variables...          │
├─────────────────────────────────────┤
│ 🌍 Global Variables                 │
│   appName        ReqX-Atelier      ✓│
│   apiVersion     v1                ✓│
│   defaultTimeout 30000             ✓│
│   userAgent      ReqX-Atelier/1.0  ✓│
├─────────────────────────────────────┤
│ 🌐 Environment Variables            │
│   baseUrl        https://api-dev... ✓│
│   apiKey         dev-key-123       ✓│
│   timeout        5000              ✓│ ← Global値を上書き
├─────────────────────────────────────┤
│ [+ Add to Global] [+ Add to Environment] │
│ [📋 Import] [📤 Export] [⚙️ Settings]     │
└─────────────────────────────────────┘
```

#### B-3. 変数行の操作

- **インライン編集**: 名前・値をダブルクリックで直接編集
- **有効/無効切り替え**: チェックボックスでワンクリック
- **値の表示**: 長い値は省略表示、ホバーで全文表示
- **セキュア変数**: パスワードやトークンは`***`で表示、ホバーで表示

### C. 変数の使用

#### C-1. 変数参照構文

```
URL: ${baseUrl}/api/v1/users
Header: Authorization: Bearer ${userToken}
Body: {"timeout": ${timeout}, "env": "${environment}"}
```

#### C-2. リアルタイムプレビュー

変数を含むフィールドで、解決された値をツールチップ表示：

```
入力: ${baseUrl}/users/${userId}
ツールチップ: https://api-dev.example.com/users/123
```

#### C-3. 未定義変数の警告

未定義の変数は黄色でハイライト表示し、ツールチップで警告：

```
入力: ${undefinedVar}
表示: ${undefinedVar} ⚠️
ツールチップ: Variable 'undefinedVar' is not defined
```

### D. 高度な機能

#### D-1. 変数のスコープ設計

変数は使用範囲に応じて2つのスコープレベルで管理します：

##### スコープレベル（優先順位：高い順）

**1. Environment Level（環境レベル）🌐**

- **用途**: 特定環境での設定値
- **例**: `baseUrl`, `apiKey`, `timeout`
- **UI**: 変数パネルの「Environment Variables」セクション
- **優先度**: Global変数より優先される

**2. Global Level（グローバルレベル）🌍**

- **用途**: 全環境共通の設定値
- **例**: `appName`, `apiVersion`, `defaultTimeout`, `userAgent`
- **UI**: 変数パネルの「Global Variables」セクション
- **優先度**: Environment変数で上書きされない限り、すべての環境で利用可能

##### 実際の使用例

```
🌍 Global Variables
  appName: "ReqX-Atelier"
  apiVersion: "v1"
  defaultTimeout: "30000"
  userAgent: "ReqX-Atelier/1.0"

🌐 Environment Variables (Development)
  baseUrl: "https://api-dev.example.com"
  apiKey: "dev-key-123"
  timeout: "5000"  # Global の defaultTimeout を上書き

📄 Get User Request
  URL: ${baseUrl}/api/${apiVersion}/users
  Headers:
    Authorization: Bearer ${apiKey}
    User-Agent: ${userAgent}

  # 解決される値:
  # baseUrl: "https://api-dev.example.com" (Environment)
  # apiVersion: "v1" (Global)
  # apiKey: "dev-key-123" (Environment)
  # userAgent: "ReqX-Atelier/1.0" (Global)
  # timeout: "5000" (Environment が Global を上書き)
```

##### 変数の優先順位

```
変数名が重複した場合の優先順位：
Environment Level > Global Level

例：
🌍 Global: { timeout: "30000" }
🌐 Development: { timeout: "5000" }
→ 結果: timeout = "5000" (Environment が優先)
```

#### D-2. 変数の種類

- **テキスト変数**: 通常の文字列値
- **セキュア変数**: パスワード、APIキーなど（値を隠す）
- **計算変数**: 他の変数を参照した値（例: `${baseUrl}/v${version}`）

#### D-3. インポート/エクスポート

- **.env形式**: 標準的な環境変数ファイル
- **JSON形式**: ReqX-Atelier独自フォーマット
- **Postman形式**: Postmanから移行可能

## UX/UI 改善点

### 1. 発見しやすさ

- 変数機能があることを明確に示すUI
- 初回起動時のチュートリアル表示
- 変数使用例のテンプレート提供

### 2. 学習コストの削減

- 一般的な`${}`構文を採用
- 環境切り替えボタンを目立つ場所に配置
- 変数の自動補完機能

### 3. エラーハンドリング

- 分かりやすいエラーメッセージ
- 修正方法の提案
- 未定義変数の一覧表示

### 4. パフォーマンス

- 変数解決の高速化（1ms以内）
- 大量変数でもスムーズな操作
- 非同期でのUI更新

## 実装優先度

### Phase 1: 基本機能（MVP）

1. 環境選択UI
2. 基本的な変数管理パネル
3. `${}`構文による変数参照
4. リクエスト送信時の変数解決

### Phase 2: UX強化

1. リアルタイムプレビュー
2. 変数の自動補完
3. 未定義変数の警告表示
4. インライン編集

### Phase 3: 高度な機能

1. セキュア変数
2. 計算変数
3. インポート/エクスポート
4. フォルダスコープ

## 技術仕様

### データ構造

```typescript
interface VariableSet {
  [key: string]: {
    value: string;
    enabled: boolean;
    secure?: boolean;
    description?: string;
  };
}

interface EnvironmentConfig {
  id: string;
  name: string;
  variables: VariableSet;
  isActive: boolean;
}
```

### 保存形式

- **LocalStorage**: 現在の環境と変数設定
- **ファイル同期**: 将来的にクラウド同期対応

## スコープ設計のベストプラクティス

### シンプルな2レベルスコープ

#### 🌍 Global Level（全環境共通）

**使用場面:**

- すべての環境で共通の設定
- アプリケーション固有の定数
- デフォルト値

**具体例:**

```javascript
// Global Variables
appName: 'ReqX-Atelier';
apiVersion: 'v1';
defaultTimeout: '30000';
userAgent: 'ReqX-Atelier/1.0';
contentType: 'application/json';
```

#### 🌐 Environment Level（環境固有）

**使用場面:**

- 環境によって変わる設定
- APIエンドポイント、認証情報
- 環境固有のタイムアウト値

**具体例:**

```javascript
// Development Environment
baseUrl: 'https://api-dev.example.com';
apiKey: 'dev-key-123';
timeout: '5000'; // Global の defaultTimeout を上書き

// Production Environment
baseUrl: 'https://api.example.com';
apiKey: 'prod-key-789';
// timeout は未定義 → Global の defaultTimeout を使用
```

### 推奨する変数配置戦略

**明確な配置ルール:**

1. **環境に依存しない値 → Global**: appName, apiVersion, userAgent など
2. **環境で変わる値 → Environment**: baseUrl, apiKey, 環境固有の設定
3. **一時的な値は直接記述**: リクエスト固有の値は変数化せずに直接入力

### UI上での分かりやすさ

#### 変数の出自表示

変数にカーソルを合わせると、どこで定義されているかを表示：

```
ツールチップ:
┌─────────────────────────┐
│ timeout: "5000"         │
│ Scope: 🌐 Environment   │
│ Overrides: Global       │
└─────────────────────────┘

┌─────────────────────────┐
│ apiVersion: "v1"        │
│ Scope: 🌍 Global        │
└─────────────────────────┘
```

#### 変数の優先順位表示

現在の環境で有効な変数を表示：

```
現在の環境: Development

✨ 有効な変数
🌐 baseUrl: "https://api-dev..."    ← Environment
🌐 apiKey: "dev-key-123"           ← Environment
🌐 timeout: "5000"                 ← Environment (Globalを上書き)
🌍 appName: "ReqX-Atelier"         ← Global
🌍 apiVersion: "v1"                ← Global
🌍 userAgent: "ReqX-Atelier/1.0"   ← Global
```

## まとめ

この設計では、**シンプルな2レベルスコープ**を採用することで、変数の定義場所を明確にし、ユーザーの混乱を防ぎます。

### 🎯 **設計の核心**

- **Global Level**: 全環境共通の設定（appName, apiVersion, デフォルト値など）
- **Environment Level**: 環境固有の設定（baseUrl, apiKey など）
- **フォルダレベルを廃止**: 変数の所在を明確化し、複雑性を排除

### 🚀 **ユーザビリティの向上**

- **学習コストの削減**: 2レベルのみのシンプルな構造
- **変数の所在が明確**: GlobalまたはEnvironmentの2箇所のみ
- **直感的な優先順位**: Environment が Global を上書きする単純なルール

### 📈 **実装の利点**

- **複雑性の大幅削減**: フォルダ階層での継承を排除
- **保守性の向上**: 変数の定義場所が限定され、管理が容易
- **デバッグの簡易化**: 変数の出自が明確で問題解決が迅速

この設計により、**「どこで変数が定義されているか分からない」**という問題を根本的に解決し、開発者が迷わずに効率的にAPI開発を進められる環境を実現します。
