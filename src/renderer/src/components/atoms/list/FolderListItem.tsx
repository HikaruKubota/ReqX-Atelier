import React from 'react';
import clsx from 'clsx';
import { FiChevronDown, FiChevronRight, FiFolder } from 'react-icons/fi';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  open: boolean;
  onToggle: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  open,
  onToggle,
  onContextMenu,
}) => (
  <div
    onClick={onToggle}
    onContextMenu={(e) => {
      e.preventDefault();
      onContextMenu?.(e);
    }}
    className={clsx(
      'px-3 py-2 my-1 cursor-pointer border rounded flex items-center gap-2',
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800',
    )}
  >
    {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
    <FiFolder size={16} />
    <span>{folder.name}</span>
  </div>
);

export default FolderListItem;
