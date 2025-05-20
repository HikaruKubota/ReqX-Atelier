import '@testing-library/jest-dom';
import { vi } from 'vitest';

// scrollIntoView は JSDOM には存在しないためモックする
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});
