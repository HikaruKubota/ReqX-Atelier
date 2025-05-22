import React from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../types';
import { MethodIcon } from '../MethodIcon';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  onClick,
  onContextMenu,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClick();
      }
    }}
    onContextMenu={(e) => {
      e.preventDefault();
      onContextMenu?.(e);
    }}
    className={clsx(
      'px-3 py-2 my-1 cursor-pointer border rounded flex justify-between items-center transition-colors',
      isActive
        ? 'font-bold border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
        : 'bg-white font-normal border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200',
    )}
  >
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <MethodIcon method={request.method} />
      <span className="truncate">{request.name}</span>
    </div>
  </div>
);
