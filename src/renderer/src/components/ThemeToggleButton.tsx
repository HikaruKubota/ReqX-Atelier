import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export const ThemeToggleButton: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  return (
    <button className="btn btn-sm" onClick={toggleMode}>
      {mode === 'light' ? 'ダークモード' : 'ライトモード'}
    </button>
  );
};
