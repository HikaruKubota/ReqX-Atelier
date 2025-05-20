import React, { useEffect, useRef } from 'react';
import { BaseButton } from '../button/BaseButton';
import clsx from 'clsx';

export interface ContextMenuItem {
  label: string;
  onClick?: () => void;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
  title?: string;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  items,
  onClose,
  title,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={clsx(
        'absolute bg-white border rounded shadow z-50 text-sm dark:bg-gray-700 dark:border-gray-600',
        className,
      )}
      style={{ top: position.y, left: position.x }}
    >
      {title && <div className="px-4 py-2 font-bold border-b dark:border-gray-600">{title}</div>}
      {items.map((item, idx) => (
        <BaseButton
          key={idx}
          variant="ghost"
          size="sm"
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={() => {
            item.onClick?.();
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
