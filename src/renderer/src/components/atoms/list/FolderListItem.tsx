import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const FolderListItem = forwardRef<HTMLDivElement, FolderListItemProps>(
  ({ folder, isOpen, onToggle, className }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onToggle}
        className={clsx(
          'px-3 py-2 my-1 cursor-pointer border rounded flex items-center gap-2 transition-colors',
          'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text)]',
          className,
        )}
      >
        {isOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
        <FiFolder size={16} />
        <span className="flex-1 truncate">{folder.name}</span>
      </div>
    );
  },
);

FolderListItem.displayName = 'FolderListItem';
