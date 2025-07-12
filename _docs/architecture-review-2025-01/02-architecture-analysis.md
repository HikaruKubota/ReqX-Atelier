# アーキテクチャ詳細分析

## 1. プロジェクト構造

### 技術スタック

- **フロントエンド**: React 18.3 + TypeScript 5.x
- **デスクトップ**: Electron 36.x
- **ビルドツール**: Vite 6.0
- **状態管理**: Zustand 5.0
- **UIライブラリ**: Tailwind CSS + Headless UI
- **テスト**: Vitest + React Testing Library + Playwright

### ディレクトリ構成

```
ReqX-Atelier/
├── main.js                    # Electronメインプロセス（53行）
├── src/
│   ├── renderer/             # Reactアプリケーション
│   │   ├── src/
│   │   │   ├── components/   # UIコンポーネント
│   │   │   │   ├── atoms/   # 基本UI要素（56個）
│   │   │   │   ├── molecules/ # 複合コンポーネント（8個）
│   │   │   │   └── organisms/ # 複雑な機能（2個）
│   │   │   ├── hooks/        # カスタムフック（16個）
│   │   │   ├── store/        # Zustand状態管理（4ストア）
│   │   │   ├── types/        # TypeScript型定義
│   │   │   └── utils/        # ユーティリティ関数
│   │   └── index.html
├── docs/                     # ユーザー向けドキュメント
└── _docs/                    # 開発者向けドキュメント
```

## 2. アーキテクチャパターン

### Atomic Design実装状況

| レベル    | コンポーネント数 | 割合  | 評価 |
| --------- | ---------------- | ----- | ---- |
| Atoms     | 30               | 53.6% | 適切 |
| Molecules | 6                | 10.7% | 不足 |
| Organisms | 2                | 3.6%  | 不足 |
| その他    | 18               | 32.1% | -    |

**問題点**: Moleculesレベルが薄く、AtomsからOrganismsへの飛躍が大きい

### IPC通信アーキテクチャ

```
Renderer Process          Main Process
    │                         │
    ├─ api.ts ──────────────→├─ main.js
    │  (IPC wrapper)          │  (HTTP executor)
    │                         │
    └─ useApiResponseHandler  └─ Axios
       (Response handling)        (CORS bypass)
```

**優れた点**: シンプルで効果的なCORS回避戦略

## 3. 状態管理アーキテクチャ

### Zustandストア構成

| ストア             | 行数 | 複雑度 | 責務                                      |
| ------------------ | ---- | ------ | ----------------------------------------- |
| savedRequestsStore | 315  | 高     | リクエスト/フォルダ管理、マイグレーション |
| variablesStore     | 232  | 中     | 環境変数/グローバル変数管理               |
| folderTreeStore    | 444  | 高     | ツリー表示状態、D&D管理                   |
| themeStore         | 22   | 低     | テーマ切り替え                            |

### 状態管理の課題

1. **データ正規化の欠如**

   ```typescript
   // 現状（非正規化）
   interface SavedFolder {
     requestIds: string[]; // 重複管理
   }

   // 推奨（正規化）
   interface NormalizedState {
     requestToFolder: Record<string, string>;
   }
   ```

2. **状態の散在**
   - Zustandストア（グローバル）
   - useState（ローカル）
   - useRef（非制御）
   - 混在による複雑性増大

## 4. コンポーネント複雑度分析

### 最も複雑なコンポーネントTOP5

| 順位 | コンポーネント            | 行数 | 主な問題                        |
| ---- | ------------------------- | ---- | ------------------------------- |
| 1    | App.tsx                   | 680  | 責務過多、21個のuseState/useRef |
| 2    | VariablesPanel.tsx        | 441  | UI/ロジック混在                 |
| 3    | RequestCollectionTree.tsx | 388  | 164行のレンダリング関数         |
| 4    | FolderTreeAdapter.tsx     | 292  | 複雑な状態同期                  |
| 5    | BodyEditorKeyValue.tsx    | 253  | 制御/非制御の両対応             |

## 5. パフォーマンス分析

### 主な課題

1. **不要な再レンダリング**

   - ストア全体の監視による過剰な更新
   - 選択的サブスクリプションの未使用

2. **メモ化戦略の不足**

   ```typescript
   // 問題例
   const { savedRequests, savedFolders } = useSavedRequestsStore();

   // 改善例
   const savedRequests = useSavedRequestsStore((state) => state.savedRequests);
   ```

3. **大量データ処理**
   - 仮想化の限定的使用
   - 配列操作による全体再計算

## 6. セキュリティ考慮事項

### 現状

- `contextIsolation: false` によるセキュリティリスク
- nodeIntegration有効化による潜在的脆弱性

### 推奨対策

- contextBridgeを使用したセキュアなIPC実装
- Content Security Policy (CSP) の導入
- 最小権限の原則に基づくAPI設計
