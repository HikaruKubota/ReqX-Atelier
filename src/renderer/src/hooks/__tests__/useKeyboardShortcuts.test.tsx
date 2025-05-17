// hooks/__tests__/useKeyboardShortcuts.test.tsx
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { describe, it, expect, vi } from 'vitest';

const press = (
  key: string,
  mod: { meta?: boolean; ctrl?: boolean } = { meta: true },
) =>
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      metaKey: !!mod.meta,
      ctrlKey: !!mod.ctrl,
    }),
  );

describe('useKeyboardShortcuts', () => {
  it('calls onSave on ⌘+S', () => {
    const save = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({ onSave: save, onSend: vi.fn(), onNew: vi.fn() }),
    );
    press('s');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('calls onSend on ⌘+Enter', () => {
    const send = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({ onSave: vi.fn(), onSend: send, onNew: vi.fn() }),
    );
    press('Enter');
    expect(send).toHaveBeenCalled();
  });

  it('calls onNew on ⌘+N', () => {
    const onNew = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onSave: vi.fn(), onSend: vi.fn(), onNew }));
    press('n');
    expect(onNew).toHaveBeenCalled();
  });
});
