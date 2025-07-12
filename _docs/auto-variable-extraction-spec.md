# 自動変数抽出機能 仕様書

## 概要

APIレスポンスから特定の値を自動的に変数に反映する機能。ログインレスポンスのJWTトークンなど、後続のリクエストで使用する値を自動的に変数として保存し、再利用を容易にする。

## ユースケース

### 主要ユースケース

1. **認証フロー**: ログインAPIからJWTトークンを取得し、Authorizationヘッダーに自動設定
2. **セッション管理**: セッションIDやCSRFトークンの自動取得と設定
3. **動的パラメータ**: 作成したリソースのIDを後続のAPIで使用
4. **環境固有の値**: 環境ごとに異なるAPIキーやエンドポイントの管理

### 具体例

```json
// ログインレスポンス
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_value",
    "user": {
      "id": "user123",
      "name": "John Doe"
    }
  }
}

// 自動的に以下の変数が設定される
// ${authToken} = "eyJhbGciOiJIUzI1NiIs..."
// ${refreshToken} = "refresh_token_value"

// ${userId} = "user123"
```

## 機能要件

### 1. 変数抽出設定（Tests/Scripts タブ）

#### UI設計

```
┌─────────────────────────────────────────────────────────────┐
│ Request Editor Panel                                        │
├─────────────────────────────────────────────────────────────┤
│ [Params] [Headers] [Body] [Tests] ← 新規タブ              │
├─────────────────────────────────────────────────────────────┤
│ Tests (Post-response Scripts)                               │
│                                                             │
│ ┌─ Extract Variables ────────────────────────────────────┐ │
│ │ Extract values from response and save as variables      │ │
│ │                                                         │ │
│ │ [+ Add Extraction Rule]                                │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────┐   │ │
│ │ │ Source: [Response Body ▼]                       │   │ │
│ │ │ Path: $.data.token                              │   │ │
│ │ │ Variable: authToken                             │   │ │
│ │ │ Scope: [Environment ▼]                          │   │ │
│ │ │ [🗑️]                                            │   │ │
│ │ └─────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────┐   │ │
│ │ │ Source: [Response Header ▼]                     │   │ │
│ │ │ Header Name: X-CSRF-Token                       │   │ │
│ │ │ Variable: csrfToken                             │   │ │
│ │ │ Scope: [Global ▼]                               │   │ │
│ │ │ [🗑️]                                            │   │ │
│ │ └─────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Custom Scripts ───────────────────────────────────────┐ │
│ │ // JavaScript code to run after response               │ │
│ │ // Available variables: response, variables            │ │
│ │                                                         │ │
│ │ if (response.status === 200) {                         │ │
│ │   const data = response.json();                        │ │
│ │   variables.set('userId', data.user.id);               │ │
│ │   console.log('User logged in:', data.user.name);      │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. 抽出ルール設定

#### 抽出元（Source）

- **Response Body (JSON)**: JSONPath形式でパスを指定
- **Response Body (Text)**: 正規表現で抽出
- **Response Header**: ヘッダー名を指定
- **Response Status**: ステータスコード
- **Response Time**: レスポンス時間

#### パス指定方法

- **JSONPath**: `$.data.token`, `$.users[0].id`, `$..email`
- **正規表現**: `token:\s*"([^"]+)"`, `id=(\d+)`
- **ヘッダー名**: `Authorization`, `X-Request-ID`

#### 変数スコープ

- **Global**: 全環境で使用可能
- **Environment**: 現在の環境でのみ使用可能

### 3. スクリプト実行環境

#### 利用可能なオブジェクト

```javascript
// response オブジェクト
response = {
  status: 200,
  statusText: 'OK',
  headers: {
    'content-type': 'application/json',
    'x-request-id': 'req_123'
  },
  json(): any,      // JSONとしてパース
  text(): string,   // テキストとして取得
  time: 245        // レスポンス時間（ms）
}

// variables オブジェクト
variables = {
  get(name: string): string,
  set(name: string, value: string, options?: {
    scope?: 'global' | 'environment',
    secure?: boolean
  }): void,
  has(name: string): boolean,
  delete(name: string): void
}

// 環境情報
environment = {
  name: string,  // 'Development', 'Production' など
  id: string
}

// ユーティリティ関数
utils = {
  randomInt(min: number, max: number): number,
  randomString(length: number): string,
  timestamp(): number,
  uuid(): string,
  base64Encode(text: string): string,
  base64Decode(text: string): string,
  jsonPath(obj: any, path: string): any
}
```

#### スクリプト例

```javascript
// 認証トークンの自動設定
if (response.status === 200) {
  const data = response.json();
  variables.set('authToken', data.token, { scope: 'environment' });
  variables.set('refreshToken', data.refreshToken, {
    scope: 'environment',
    secure: true,
  });
  console.log('Authentication successful');
}

// 動的なユーザーID取得
const users = response.json().users;
users.forEach((user, index) => {
  variables.set(`user${index}Id`, user.id);
});

// 条件付き変数設定
if (environment.name === 'Production') {
  variables.set('apiUrl', response.headers['x-api-endpoint']);
}
```

### 4. 実行タイミング

1. **レスポンス受信後**: APIレスポンスを受信した直後
2. **エラー時の動作**:
   - 抽出ルール: エラー時はスキップ
   - カスタムスクリプト: try-catchで保護して実行

### 5. UI表示

#### 変数抽出結果の表示

```
┌─ Response Display Panel ────────────────────────────────────┐
│ [Body] [Headers] [Variables] ← 新規タブ                     │
├─────────────────────────────────────────────────────────────┤
│ Variables Set                                               │
│                                                             │
│ ✓ authToken = "eyJhbGciOiJIUzI1NiIs..." (Environment)     │
│ ✓ refreshToken = "••••••••" (Environment, Secure)          │
│ ✓ userId = "user123" (Environment)                         │
│ ✓ csrfToken = "csrf_token_value" (Global)                  │
│                                                             │
│ Script Console:                                             │
│ > Authentication successful                                 │
│ > User logged in: John Doe                                  │
└─────────────────────────────────────────────────────────────┘
```

### 6. エラーハンドリング

#### 抽出エラー

- JSONPathが無効: エラーメッセージを表示、変数は設定しない
- パスが存在しない: 警告を表示、変数は設定しない
- 型エラー: 文字列に変換して設定

#### スクリプトエラー

- 構文エラー: エディタで赤線表示
- 実行時エラー: コンソールにエラー表示、後続処理は継続

## 技術設計

### データ構造

```typescript
interface ExtractionRule {
  id: string;
  source: 'body-json' | 'body-text' | 'header' | 'status' | 'time';
  path?: string; // JSONPath or regex
  headerName?: string; // for header source
  variableName: string;
  scope: 'global' | 'environment';
  enabled: boolean;
}

interface TestScript {
  extractionRules: ExtractionRule[];
  customScript: string;
  enabled: boolean;
}

interface SavedRequest {
  // 既存のフィールド...
  testScript?: TestScript;
}
```

### 実行フロー

1. APIレスポンス受信
2. 抽出ルールの実行
   - 各ルールを順次処理
   - 成功した抽出を変数に保存
3. カスタムスクリプトの実行
   - サンドボックス環境で実行
   - 変数APIを通じて変数を操作
4. 結果の表示
   - 設定された変数をUIに表示
   - コンソール出力を表示

### セキュリティ考慮事項

1. **スクリプトサンドボックス**

   - `eval()`の使用を避ける
   - Function constructorまたはVM2などを使用
   - グローバルオブジェクトへのアクセスを制限

2. **変数の保護**

   - セキュア変数は値を隠蔽
   - スクリプトからの読み取りも制限

3. **実行時間制限**
   - スクリプト実行に5秒のタイムアウト設定
   - 無限ループ対策

## 実装優先順位

### Phase 1（MVP）

1. JSONPath による Response Body からの抽出
2. 基本的な抽出ルールUI
3. 環境変数への保存

### Phase 2

1. カスタムスクリプト機能
2. Response Header からの抽出
3. 正規表現サポート

### Phase 3

1. スクリプトデバッガー
2. 抽出ルールのテンプレート
3. 変数の自動補完強化

## 成功指標

1. 認証フローが3クリック以内で設定可能
2. 変数抽出の成功率 95% 以上
3. スクリプト実行時間 100ms 以内
