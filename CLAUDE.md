# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReqX-Atelier is an Electron + React + TypeScript desktop application for API testing, similar to Postman or Insomnia. It uses Vite for development and building, with a component-based architecture following the Atomic Design pattern.

**Requirements**: Node.js 20+

## Development Commands

```bash
# Install dependencies
npm install

# Run the Electron app with hot reload
npm run dev

# Run Electron + Storybook simultaneously
npm run dev:all

# Run tests
npm run test
npm run test:watch  # Watch mode
# Run a single test file
npm run test -- path/to/test.file

# Run linting and type checking
npm run lint
npm run typecheck

# Format code
npm run format

# Run Storybook
npm run storybook

# Build the application
npm run build:renderer  # Build React app
npm run build:electron  # Package Electron app

# Run E2E tests
npm run e2e
```

## Architecture

### Process Communication

- **Main Process** (`main.js`): Handles IPC communication and makes actual HTTP requests to bypass CORS
- **Renderer Process** (`src/renderer/`): React application that sends API requests via IPC

### Component Structure

```
src/renderer/src/components/
├── atoms/       # Basic UI elements (buttons, inputs, modals)
├── molecules/   # Composite components (rows, alerts)
├── organisms/   # Complex features (tab bars, guides)
└── *.tsx        # Page-level components
```

### State Management

- **Zustand stores** in `src/store/`:
  - `savedRequestsStore.ts`: Manages saved API requests
  - `themeStore.ts`: Handles dark/light theme switching

### Key Features Implementation

- **API Requests**: Frontend sends request data via IPC to main process, which executes the actual HTTP request
- **Request Collections**: Tree structure with folders and requests, drag-and-drop support
- **Tab Management**: Multiple request tabs with keyboard shortcuts
- **Response Display**: Formatted JSON, headers, and status information

### API Communication Flow

1. UI components use `src/renderer/src/api.ts` to send requests
2. Main process (`main.js`) receives IPC messages and makes HTTP calls with Axios
3. Response is handled by `useApiResponseHandler` hook
4. Results are displayed in ResponseDisplayPanel component

## Testing Approach

- **Unit Tests**: Vitest with React Testing Library
- **Component Tests**: Storybook for visual testing
- **Integration Tests**: MSW for API mocking
- **E2E Tests**: Playwright

Always run tests before committing changes:

```bash
npm run test
npm run lint
npm run typecheck
```

## Important Considerations

- **IPC Security**: The app disables some Electron security features (`contextIsolation: false`) to enable IPC communication
- **CORS Handling**: Main process makes HTTP requests to bypass browser CORS restrictions
- **Dark Mode**: Implemented via Tailwind CSS class strategy, toggled through theme store
- **i18n**: Supports English and Japanese translations in `src/locales/`
- **Styling**: Theme colors defined as CSS variables in `src/theme/colors.ts`
- **Hot Reload**: Works for both Electron main process and React renderer
- **First-time E2E setup**: Run `npx playwright install` before running E2E tests

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

## Notification System for Claude Code

IMPORTANT: You MUST use the notification system to alert the human when:

**CRITICAL RULE**: Always notify BEFORE taking any action that modifies the system state or requires human permission. If unsure whether an action needs permission, notify first.

**FUNDAMENTAL PRINCIPLE**: You are an AI assistant helping the human with their tasks. You should NEVER take autonomous actions without explicit permission. This includes:
- Making any changes to files without being asked
- Running commands that weren't specifically requested
- Making decisions about what to do next without asking
- Proceeding with tasks that weren't explicitly requested

If the human asks you to do Task A, do ONLY Task A. Do not proceed to do Task B, C, or D unless explicitly asked. Always notify and wait for the next instruction.

1. **Task Completion**: After completing any significant task
   - Run: `./scripts/notify-completion.sh "タスクが完了しました: [具体的なタスク名]"`
   - Examples: After running tests, builds, large refactoring, fixing bugs

2. **Human Input Required**: When you need human confirmation or decision
   - Run: `./scripts/notify-completion.sh "確認が必要です: [理由]"`
   - Examples: Ambiguous requirements, multiple solution options, permission needed
   - IMPORTANT: Always notify BEFORE running commands that might require human interaction (git push, git pull, npm publish, etc.)

3. **Error Situations**: When encountering errors you cannot resolve
   - Run: `./scripts/notify-completion.sh "エラー: [エラー内容]"`
   - Examples: Test failures you can't fix, build errors, missing dependencies

4. **Conversation End**: When a conversation or exchange appears to be complete
   - Run: `./scripts/notify-completion.sh "会話が終了しました"`
   - Examples: After answering a question, completing a discussion, or when the human says thank you

Always notify at the END of your work or when waiting for human input. This helps the human know when to check back on your progress.

### Special Cases for Notifications

**File System Operations**: Always notify BEFORE:
- Creating new files - Run: `./scripts/notify-completion.sh "新しいファイルを作成します: [ファイル名]"`
- Deleting files - Run: `./scripts/notify-completion.sh "ファイルを削除します: [ファイル名]"`
- Making significant file modifications - Run: `./scripts/notify-completion.sh "ファイルを大幅に変更します: [ファイル名]"`

**Git Operations**: Always notify BEFORE executing these commands:
- `git commit` - Run: `./scripts/notify-completion.sh "git commitを実行します"`
- `git push` - Run: `./scripts/notify-completion.sh "git pushを実行します"`
- `git pull` - Run: `./scripts/notify-completion.sh "git pullを実行します"`
- `git merge` - Run: `./scripts/notify-completion.sh "git mergeを実行します"`
- `git checkout` to different branch - Run: `./scripts/notify-completion.sh "ブランチを切り替えます: [ブランチ名]"`
- Any other git command that might require authentication or user interaction

**Package Management**: Always notify BEFORE:
- `npm install` (new packages) - Run: `./scripts/notify-completion.sh "新しいパッケージをインストールします: [パッケージ名]"`
- `npm uninstall` - Run: `./scripts/notify-completion.sh "パッケージをアンインストールします: [パッケージ名]"`
- `npm publish` - Run: `./scripts/notify-completion.sh "npm publishを実行します"`
- Any command that modifies package registries or requires authentication

**System Commands**: Always notify BEFORE:
- Running build scripts - Run: `./scripts/notify-completion.sh "ビルドを実行します"`
- Running deployment scripts - Run: `./scripts/notify-completion.sh "デプロイスクリプトを実行します"`
- Any command that could have side effects outside the project directory
