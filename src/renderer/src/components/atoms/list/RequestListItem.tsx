import React from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../types';
import { MethodIcon } from '../MethodIcon';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  draggableId?: string;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  onClick,
  onContextMenu,
  draggableId,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: draggableId || request.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
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
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-2">
        <MethodIcon method={request.method} />
        <span>{request.name}</span>
      </div>
    </div>
  );
};
