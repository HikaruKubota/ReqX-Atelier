/**
 * Global MSW server instance for Vitest.
 *
 * 他のテストファイルから `import { server } from '../../test/server'`
 * として参照し、必要に応じて `server.use(...)` でハンドラを上書きします。
 * setup/teardown は `src/test/setup.ts` で行います。
 */

import { setupServer } from 'msw/node';

// 何もハンドラを登録しないで起動。各テストで上書き可能。
export const server = setupServer();
