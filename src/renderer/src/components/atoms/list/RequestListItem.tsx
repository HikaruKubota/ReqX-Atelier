import React from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../hooks/useSavedRequests';

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
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="px-2 py-1 text-xs bg-red-200 hover:bg-red-300 border-none rounded cursor-pointer"
      type="button"
    >
      X
    </button>
  </div>
);
