import React from 'react';
import clsx from 'clsx';
import { FiChevronDown, FiChevronRight, FiFolder } from 'react-icons/fi';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  isOpen: boolean;
  depth?: number;
  onToggle: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  isOpen,
  depth = 0,
  onToggle,
  onContextMenu,
}) => (
  <div
    style={{ paddingLeft: depth * 12 }}
    onClick={onToggle}
    onContextMenu={(e) => {
      e.preventDefault();
      onContextMenu?.(e);
    }}
    className={clsx(
      'px-3 py-2 my-1 cursor-pointer border rounded flex items-center gap-2 transition-colors',
      'bg-white hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200',
    )}
  >
    {isOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
    <FiFolder size={16} />
    <span>{folder.name}</span>
  </div>
);

export default FolderListItem;
