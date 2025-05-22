import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FiChevronDown, FiChevronRight, FiFolder } from 'react-icons/fi';
import clsx from 'clsx';
import type { SavedFolder } from '../../../types';
import { DragHandleButton } from '../button/DragHandleButton';

interface FolderListItemProps {
  folder: SavedFolder;
  depth: number;
  collapsed: boolean;
  onToggle: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  depth,
  collapsed,
  onToggle,
  onContextMenu,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: folder.id, data: { type: 'folder' } });

  return (
    <div ref={setNodeRef} className={clsx(isOver && 'bg-blue-100 dark:bg-gray-700')}>
      <div
        onClick={() => onToggle(folder.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu?.(e);
        }}
        className={clsx(
          'px-3 py-2 my-1 cursor-pointer border rounded flex items-center gap-2',
          'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        )}
        style={{ paddingLeft: depth * 12 }}
      >
        <DragHandleButton className="mr-1" />
        {collapsed ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
        <FiFolder size={16} />
        <span className="flex-1 truncate">{folder.name}</span>
      </div>
      {!collapsed && <div className="ml-4">{children}</div>}
    </div>
  );
};

export default FolderListItem;
