import React from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../types';
import { MethodIcon } from '../MethodIcon';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  isSelected?: boolean;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  isSelected,
  onContextMenu,
}) => (
  <div
    onContextMenu={(e) => {
      e.preventDefault();
      onContextMenu?.(e);
    }}
    className={clsx(
      'my-[1px] px-3 flex items-center gap-2 cursor-pointer transition-colors w-full',
      isActive && 'font-bold',
      isSelected && 'bg-blue-100 dark:bg-blue-700/50',
    )}
  >
    <MethodIcon size={14} method={request.method} />
    <span className="flex-1 truncate">{request.name}</span>
  </div>
);
