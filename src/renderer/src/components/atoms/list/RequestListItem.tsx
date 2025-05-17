import React from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../hooks/useSavedRequests';
import { BaseButton } from '../button/BaseButton';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  onClick,
  onDelete,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      'px-3 py-2 my-1 cursor-pointer border rounded flex justify-between items-center transition-colors',
      isActive
        ? 'bg-gray-200 font-bold border-gray-400'
        : 'bg-white font-normal border-gray-200 hover:bg-gray-100'
    )}
  >
    <span>{request.name}</span>
    <BaseButton
      variant="ghost"
      size="sm"
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="bg-red-200 hover:bg-red-300 text-xs px-2 py-1 rounded"
      type="button"
    >
      X
    </BaseButton>
  </div>
);
