import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

interface FolderListItemProps {
  id: string;
  name: string;
  level: number;
  collapsed: boolean;
  onToggle: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  id,
  name,
  level,
  collapsed,
  onToggle,
  onContextMenu,
  children,
}) => {
  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    transform,
  } = useDraggable({ id: `folder:${id}` });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `folder:${id}` });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  return (
    <div ref={setDropRef} className="mb-1">
      <div
        ref={setDragRef}
        style={{ ...style, marginLeft: level * 10 }}
        className={clsx(
          'px-2 py-1 flex items-center cursor-pointer border rounded',
          isOver ? 'bg-blue-100 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-800',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu?.(e);
        }}
        {...listeners}
        {...attributes}
      >
        <span className="mr-1">{collapsed ? '▶' : '▼'}</span>
        <span>{name}</span>
      </div>
      {!collapsed && <div style={{ marginLeft: level * 10 + 15 }}>{children}</div>}
    </div>
  );
};

export default FolderListItem;
