import React from 'react';
import { FiChevronDown, FiChevronRight, FiFolder } from 'react-icons/fi';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  depth: number;
  open: boolean;
  onToggle: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  depth,
  open,
  onToggle,
  onContextMenu,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: `folder-${folder.id}` });
  const { setNodeRef: setDropRef } = useDroppable({ id: `folder-${folder.id}` });

  const setRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return (
    <div
      ref={setRef}
      onClick={() => {
        if (!isDragging) onToggle();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e);
      }}
      className={clsx(
        'px-3 py-2 my-1 cursor-pointer border rounded flex items-center bg-gray-100 dark:bg-gray-900',
      )}
      style={{ marginLeft: depth * 12, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
      <FiFolder className="mx-1" size={14} />
      <span>{folder.name}</span>
    </div>
  );
};

export default FolderListItem;
