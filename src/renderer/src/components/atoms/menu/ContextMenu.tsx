import React, { useEffect } from 'react';
import BaseButton from '../button/BaseButton';

export interface ContextMenuItem {
  key: string;
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 bg-white dark:bg-gray-700 border rounded shadow"
    >
      {items.map((item) => (
        <BaseButton
          key={item.key}
          variant="ghost"
          size="sm"
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </BaseButton>
      ))}
    </div>
  );
};

export default ContextMenu;
