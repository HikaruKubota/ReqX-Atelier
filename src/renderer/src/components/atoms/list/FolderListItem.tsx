import React from 'react';
import { FiFolder, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import clsx from 'clsx';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  collapsed: boolean;
  onToggle: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  collapsed,
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
      'px-2 py-1 my-1 cursor-pointer rounded flex items-center gap-1',
      'bg-yellow-100 dark:bg-gray-700 hover:bg-yellow-200 dark:hover:bg-gray-600',
    )}
  >
    {collapsed ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
    <FiFolder className="text-yellow-600" size={16} />
    <span className="flex-1 truncate">{folder.name}</span>
  </div>
);

export default FolderListItem;
