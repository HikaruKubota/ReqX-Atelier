import React from 'react';

interface VariablesButtonProps {
  onClick: () => void;
}

export const VariablesButton: React.FC<VariablesButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-10 h-10 rounded-md bg-secondary hover:bg-accent transition-colors"
      title="Variables (Ctrl/Cmd + Shift + V)"
    >
      <span className="text-lg font-mono">{'{x}'}</span>
    </button>
  );
};
