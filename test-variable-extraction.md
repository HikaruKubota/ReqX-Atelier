# 変数抽出機能のテスト手順

## 1. テスト用のモックAPIレスポンス

以下のようなレスポンスを返すAPIをテスト:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "name": "Test User"
    }
  }
}
```

ヘッダー:

```
Authorization: Bearer abc123
X-Session-ID: session456
```

## 2. 変数抽出ルールの設定

1. リクエストの「変数」タブを開く
2. 以下のルールを追加:

   - 変数名: `authToken`, 抽出元: `$.data.token` (Response Body)
   - 変数名: `userId`, 抽出元: `$.data.user.id` (Response Body)
   - 変数名: `sessionId`, 抽出元: `X-Session-ID` (Response Header)

3. リクエストを保存

## 3. 動作確認

1. リクエストを送信
2. 変数パネルを開いて、以下の変数が設定されていることを確認:
   - `authToken`: JWT トークンの値
   - `userId`: "user123"
   - `sessionId`: "session456"

## 4. 保存と読み込みの確認

1. リクエストを保存
2. 別のタブを開く
3. 保存したリクエストを読み込む
4. 「変数」タブに設定したルールが復元されていることを確認
