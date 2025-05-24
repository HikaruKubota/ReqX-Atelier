import React from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../types';
import { MethodIcon } from '../MethodIcon';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  onContextMenu,
}) => (
  <div
    onContextMenu={(e) => {
      e.preventDefault();
      onContextMenu?.(e);
    }}
    className={clsx(
      'my-[1px] px-3 flex items-center gap-2 cursor-pointer transition-colors',
      isActive
        ? 'font-bold bg-[var(--color-secondary)] text-[var(--color-background)]'
        : 'bg-[var(--color-background)] text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-gray-800',
    )}
  >
    <MethodIcon size={14} method={request.method} />
    <span>{request.name}</span>
  </div>
);
