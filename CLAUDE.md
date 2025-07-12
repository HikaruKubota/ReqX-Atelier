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

- **Zustand stores** in `src/renderer/src/store/`:
  - `savedRequestsStore.ts`: Manages saved API requests
  - `themeStore.ts`: Handles dark/light theme switching
  - `variablesStore.ts`: Manages global and environment variables

### Key Features Implementation

- **API Requests**: Frontend sends request data via IPC to main process, which executes the actual HTTP request
- **Request Collections**: Tree structure with folders and requests, drag-and-drop support
- **Tab Management**: Multiple request tabs with keyboard shortcuts
- **Response Display**: Formatted JSON, headers, and status information
- **Variable System**: Support for `${variable}` syntax in URLs, headers, and body

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

## Git Workflow

- **Branch Protection**: Direct pushes to main branch are prevented by git hooks
- **Pull Request Flow**: All changes must go through feature branches and pull requests
- **Git Hooks**: Run `git config core.hooksPath .githooks` to enable pre-push protection
