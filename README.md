# ReqX - API Request Tool

ReqX is a simple API request tool, built with Electron and React.

## Prerequisites

- Node.js (v18.x or later recommended)
- npm

## Setup

1. Clone the repository (if you haven't already).
2. Navigate to the project directory:
   ```bash
   cd path/to/reqx
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   (If you are using pnpm as indicated in `packageManager`, you might prefer `pnpm install`)

## Development

To run the application in development mode with hot reloading for both the renderer and main processes:

```bash
npm run dev
```

This command concurrently runs:
- `npm run dev:renderer` (starts Vite dev server for the React app)
- `npm run dev:electron` (starts Electron with NODE_ENV=development)

## Building the Application

Follow these steps to build the application for production.

1.  **Install `electron-builder` (if you haven't already)**:
    This tool is used to package the Electron application. If you encounter issues during the electron build step, ensure `electron-builder` is installed as a dev dependency:
    ```bash
    npm install --save-dev electron-builder
    ```

2.  **Build the Renderer Process**:
    This step bundles the React application.
    ```bash
    npm run build:renderer
    ```
    The output will be placed in a directory like `dist/` (Vite might place it relative to the project root or `src/renderer` depending on its config, check console output for exact location - in our case it was `../../dist/` relative to vite config, meaning project_root/dist).

3.  **Package the Electron Application**:
    This step takes the built renderer code and the main process code to create a distributable application.
    ```bash
    npm run build:electron
    ```
    The packaged application will be placed in the `dist` directory (e.g., `dist/mac-arm64`, `dist/win-unpacked`).

### Building for macOS (on macOS)

The above `npm run build:electron` command, when run on macOS, will produce macOS application bundles (e.g., `.dmg`, `.zip`).

### Building for Windows (on a Windows PC)

To build the application for Windows (`.exe` installer, etc.):

1.  Ensure you are on a Windows machine.
2.  Set up the project and install dependencies as described in the "Setup" section.
3.  Install `electron-builder` if not already done (see step 1 of building).
4.  Run the build commands:
    ```bash
    npm run build:renderer
    npm run build:electron
    ```
    `electron-builder` will automatically detect the OS and build for Windows.
    You might need to configure Windows-specific build options in `package.json` under a `"build"` key or in an `electron-builder.yml` file for more advanced customization (e.g., target installer types like nsis, msi).

## Linting and Formatting

- To lint the code:
  ```bash
  npm run lint
  ```
- To format the code with Prettier:
  ```bash
  npm run format
  ```

## 日本語 (Japanese Version)

# ReqX - APIリクエストツール

ReqXは、ElectronとReactで構築された。シンプルなAPIリクエストツールです。

## 前提条件

- Node.js (v18.x 以降を推奨)
- npm

## セットアップ

1.  リポジトリをクローンします（まだの場合）。
2.  プロジェクトディレクトリに移動します:
    ```bash
    cd path/to/reqx
    ```
3.  依存関係をインストールします:
    ```bash
    npm install
    ```
    (`packageManager` でpnpmが指定されている場合は、`pnpm install` を使用することもできます)

## 開発

レンダラープロセスとメインプロセスの両方でホットリロードを有効にして開発モードでアプリケーションを実行するには:

```bash
npm run dev
```

このコマンドは以下を同時に実行します:
- `npm run dev:renderer` (Reactアプリ用のVite開発サーバーを起動)
- `npm run dev:electron` (NODE_ENV=developmentでElectronを起動)

## アプリケーションのビルド

本番用にアプリケーションをビルドするには、以下の手順に従います。

1.  **`electron-builder` をインストールします（まだの場合）**:
    このツールはElectronアプリケーションをパッケージ化するために使用されます。Electronのビルドステップで問題が発生した場合は、`electron-builder` が開発依存関係としてインストールされていることを確認してください:
    ```bash
    npm install --save-dev electron-builder
    ```

2.  **レンダラープロセスをビルドします**:
    このステップでReactアプリケーションをバンドルします。
    ```bash
    npm run build:renderer
    ```
    出力は `dist/` のようなディレクトリに配置されます（Viteの設定によっては、プロジェクトルートまたは `src/renderer` からの相対パスになる場合があります。正確な場所はコンソールの出力を確認してください。今回のケースではVite設定からの相対パス `../../dist/` であり、つまりプロジェクトルートの `dist` でした）。

3.  **Electronアプリケーションをパッケージ化します**:
    このステップでは、ビルドされたレンダラーコードとメインプロセスコードを取得して、配布可能なアプリケーションを作成します。
    ```bash
    npm run build:electron
    ```
    パッケージ化されたアプリケーションは `dist` ディレクトリに配置されます (例: `dist/mac-arm64`, `dist/win-unpacked`)。

### macOS向けビルド (macOS上)

上記の `npm run build:electron` コマンドをmacOS上で実行すると、macOSアプリケーションバンドル（例: `.dmg`, `.zip`）が生成されます。

### Windows向けビルド (Windows PC上)

Windows向け（`.exe` インストーラーなど）にアプリケーションをビルドするには:

1.  Windowsマシン上にいることを確認してください。
2.  「セットアップ」セクションの説明に従ってプロジェクトをセットアップし、依存関係をインストールします。
3.  まだの場合は `electron-builder` をインストールします（ビルドの手順1を参照）。
4.  ビルドコマンドを実行します:
    ```bash
    npm run build:renderer
    npm run build:electron
    ```
    `electron-builder` はOSを自動的に検出し、Windows用にビルドします。
    より高度なカスタマイズ（例: nsis、msiなどのインストーラータイプの指定）のためには、`package.json` の `"build"` キーの下、または `electron-builder.yml` ファイルでWindows固有のビルドオプションを設定する必要がある場合があります。

## リンティングとフォーマット

- コードをリントするには:
  ```bash
  npm run lint
  ```
- Prettierでコードをフォーマットするには:
  ```bash
  npm run format
  ```
