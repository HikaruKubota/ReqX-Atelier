import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { SavedRequest } from '../../../types';
import { RequestListItem } from './RequestListItem';

interface DraggableRequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  depth: number;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const DraggableRequestListItem: React.FC<DraggableRequestListItemProps> = ({
  request,
  isActive,
  depth,
  onClick,
  onContextMenu,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `req-${request.id}`,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ marginLeft: depth * 12, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      <RequestListItem
        request={request}
        isActive={isActive}
        onClick={onClick}
        onContextMenu={onContextMenu}
      />
    </div>
  );
};

export default DraggableRequestListItem;
