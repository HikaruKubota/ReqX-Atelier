// src/renderer/src/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';

type Shortcuts = {
  onSave: () => void;
  onSend: () => void;
  onNew: () => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onCloseTab?: () => void;
  onMoveTabRight?: () => void;
  onMoveTabLeft?: () => void;
};

export const useKeyboardShortcuts = ({
  onSave,
  onSend,
  onNew,
  onNextTab,
  onPrevTab,
  onCloseTab,
  onMoveTabRight,
  onMoveTabLeft,
}: Shortcuts) => {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 's') {
        e.preventDefault();
        onSave();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onSend();
      }
      if (e.key === 'n') {
        e.preventDefault();
        onNew();
      }
      if (e.key === 'w' && onCloseTab) {
        e.preventDefault();
        onCloseTab();
      }
      if (e.altKey && e.key === 'ArrowRight' && onNextTab) {
        e.preventDefault();
        onNextTab();
      }
      if (e.altKey && e.key === 'ArrowLeft' && onPrevTab) {
        e.preventDefault();
        onPrevTab();
      }
      if (e.shiftKey && e.key === 'ArrowRight' && onMoveTabRight) {
        e.preventDefault();
        onMoveTabRight();
      }
      if (e.shiftKey && e.key === 'ArrowLeft' && onMoveTabLeft) {
        e.preventDefault();
        onMoveTabLeft();
      }
    },
    [onSave, onSend, onNew, onNextTab, onPrevTab, onCloseTab, onMoveTabRight, onMoveTabLeft],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
};
