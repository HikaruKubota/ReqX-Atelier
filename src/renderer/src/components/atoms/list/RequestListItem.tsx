import React from 'react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SavedRequest } from '../../../types';
import { MethodIcon } from '../MethodIcon';

interface RequestListItemProps {
  request: SavedRequest;
  containerId: string | null;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  containerId,
  isActive,
  onClick,
  onContextMenu,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: request.id,
    data: { type: 'request', folderId: containerId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
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
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <MethodIcon method={request.method} />
        <span>{request.name}</span>
      </div>
    </div>
  );
};
