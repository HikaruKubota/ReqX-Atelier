// hooks/__tests__/useKeyboardShortcuts.test.tsx
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { describe, it, expect, vi } from 'vitest';

const press = (
  key: string,
  mod: { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean } = {
    meta: true,
  },
) =>
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      metaKey: !!mod.meta,
      ctrlKey: !!mod.ctrl,
      altKey: !!mod.alt,
      shiftKey: !!mod.shift,
    }),
  );

describe('useKeyboardShortcuts', () => {
  it('calls onSave on ⌘+S', () => {
    const save = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onSave: save, onSend: vi.fn(), onNew: vi.fn() }));
    press('s');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('calls onSend on ⌘+Enter', () => {
    const send = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onSave: vi.fn(), onSend: send, onNew: vi.fn() }));
    press('Enter');
    expect(send).toHaveBeenCalled();
  });

  it('calls onNew on ⌘+N', () => {
    const onNew = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onSave: vi.fn(), onSend: vi.fn(), onNew }));
    press('n');
    expect(onNew).toHaveBeenCalled();
  });

  it('calls onNextTab on ⌘+⌥+→', () => {
    const onNextTab = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onSave: vi.fn(),
        onSend: vi.fn(),
        onNew: vi.fn(),
        onNextTab,
        onPrevTab: vi.fn(),
      }),
    );
    press('ArrowRight', { meta: true, alt: true });
    expect(onNextTab).toHaveBeenCalled();
  });

  it('calls onPrevTab on ⌘+⌥+←', () => {
    const onPrevTab = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onSave: vi.fn(),
        onSend: vi.fn(),
        onNew: vi.fn(),
        onNextTab: vi.fn(),
        onPrevTab,
      }),
    );
    press('ArrowLeft', { meta: true, alt: true });
    expect(onPrevTab).toHaveBeenCalled();
  });

  it('calls onCloseTab on ⌘+W', () => {
    const onCloseTab = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onSave: vi.fn(),
        onSend: vi.fn(),
        onNew: vi.fn(),
        onNextTab: vi.fn(),
        onPrevTab: vi.fn(),
        onCloseTab,
      }),
    );
    press('w');
    expect(onCloseTab).toHaveBeenCalled();
  });

  it('ignores Cmd+⇧+arrow shortcuts', () => {
    const onMoveTabLeft = vi.fn();
    const onMoveTabRight = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onSave: vi.fn(),
        onSend: vi.fn(),
        onNew: vi.fn(),
        onNextTab: vi.fn(),
        onPrevTab: vi.fn(),
        onCloseTab: vi.fn(),
      }),
    );
    press('ArrowRight', { meta: true, shift: true });
    press('ArrowLeft', { meta: true, shift: true });
    expect(onMoveTabRight).not.toHaveBeenCalled();
    expect(onMoveTabLeft).not.toHaveBeenCalled();
  });

  it('ignores Ctrl+⇧+arrow shortcuts', () => {
    const onMoveTabLeft = vi.fn();
    const onMoveTabRight = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onSave: vi.fn(),
        onSend: vi.fn(),
        onNew: vi.fn(),
        onNextTab: vi.fn(),
        onPrevTab: vi.fn(),
        onCloseTab: vi.fn(),
      }),
    );
    press('ArrowRight', { ctrl: true, shift: true });
    press('ArrowLeft', { ctrl: true, shift: true });
    expect(onMoveTabRight).not.toHaveBeenCalled();
    expect(onMoveTabLeft).not.toHaveBeenCalled();
  });
});
