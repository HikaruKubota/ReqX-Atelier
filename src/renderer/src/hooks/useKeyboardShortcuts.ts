// src/renderer/src/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';

type Shortcuts = {
  onSave: () => void;
  onSend: () => void;
  onNew: () => void;
};

export const useKeyboardShortcuts = ({ onSave, onSend, onNew }: Shortcuts) => {
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
    },
    [onSave, onSend, onNew],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
};
