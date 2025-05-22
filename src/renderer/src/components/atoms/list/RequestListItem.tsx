import React from 'react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SavedRequest } from '../../../types';
import { MethodIcon } from '../MethodIcon';
import { DragHandleButton } from '../button/DragHandleButton';

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
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: request.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
        'px-3 py-2 my-1 cursor-pointer border rounded flex items-center gap-2 transition-colors',
        isActive
          ? 'font-bold border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          : 'bg-white font-normal border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200',
      )}
    >
      <DragHandleButton {...listeners} {...attributes} />
      <MethodIcon method={request.method} />
      <span className="flex-1 truncate">{request.name}</span>
    </div>
  );
};
