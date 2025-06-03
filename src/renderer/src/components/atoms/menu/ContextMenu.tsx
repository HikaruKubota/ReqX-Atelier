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

  useEffect(() => {
    // Adjust position to ensure menu stays within viewport
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // If menu would go off the right edge, position it to the left of cursor
      if (rect.right > viewportWidth) {
        adjustedX = Math.max(0, position.x - rect.width);
      }

      // If menu would go off the bottom edge, position it above cursor
      if (rect.bottom > viewportHeight) {
        adjustedY = Math.max(0, position.y - rect.height);
      }

      // Apply adjusted position if needed
      if (adjustedX !== position.x || adjustedY !== position.y) {
        ref.current.style.left = `${adjustedX}px`;
        ref.current.style.top = `${adjustedY}px`;
      }
    }
  }, [position]);

  return (
    <div
      ref={ref}
      className={clsx(
        'fixed bg-popover border-border border rounded shadow-md z-50 text-sm w-[200px] min-w-[200px]',
        className,
      )}
      style={{ top: position.y, left: position.x }}
    >
      {title && <div className="px-3 py-1.5 font-bold border-b border-border text-xs">{title}</div>}
      {items.map((item, idx) => (
        <BaseButton
          key={idx}
          variant="ghost"
          size="sm"
          className="block w-full text-left px-3 py-1.5 hover:bg-accent whitespace-nowrap text-xs"
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
