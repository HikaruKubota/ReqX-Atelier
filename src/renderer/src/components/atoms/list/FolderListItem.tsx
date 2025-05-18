import React from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import clsx from 'clsx';
import type { RequestFolder } from '../../../types';

interface FolderListItemProps {
  folder: RequestFolder;
  isOpen: boolean;
  onToggle: () => void;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  isOpen,
  onToggle,
}) => (
  <div
    onClick={onToggle}
    className={clsx(
      'px-2 py-1 cursor-pointer flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800',
    )}
  >
    {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
    <span className="font-semibold">{folder.name}</span>
  </div>
);
