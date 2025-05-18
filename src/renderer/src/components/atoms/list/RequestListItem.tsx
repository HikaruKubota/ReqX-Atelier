import React, { useState } from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../types';
import { DetailsButton } from '../button/DetailsButton';
import { RequestActionMenu } from '../../molecules/RequestActionMenu';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onMove: () => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  onClick,
  onDelete,
  onMove,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={onClick}
      className={clsx(
        'px-3 py-2 my-1 cursor-pointer border rounded flex justify-between items-center relative transition-colors',
        isActive
          ? 'font-bold border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          : 'bg-white font-normal border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200',
      )}
    >
      <span>{request.name}</span>
      <DetailsButton
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      />
      {open && (
        <RequestActionMenu
          onMove={() => {
            setOpen(false);
            onMove();
          }}
          onDelete={() => {
            setOpen(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
};
