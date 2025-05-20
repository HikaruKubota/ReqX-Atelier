import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom 環境では scrollIntoView が未実装のためモックを設定
if (!HTMLElement.prototype.scrollIntoView) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
}
