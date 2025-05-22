import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FiFolder, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import clsx from 'clsx';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  open,
  onToggle,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `folder-${folder.id}` });
  return (
    <div ref={setNodeRef} className="select-none">
      <div
        onClick={onToggle}
        className={clsx(
          'px-2 py-1 cursor-pointer flex items-center gap-1',
          isOver ? 'bg-blue-100 dark:bg-gray-700' : undefined,
        )}
      >
        {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
        <FiFolder size={14} />
        <span>{folder.name}</span>
      </div>
      {open && <div className="ml-4">{children}</div>}
    </div>
  );
};
