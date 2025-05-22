import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SavedRequest } from '../../../types';
import { RequestListItem } from './RequestListItem';

interface SortableRequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const SortableRequestListItem: React.FC<SortableRequestListItemProps> = ({
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RequestListItem
        request={request}
        isActive={isActive}
        onClick={onClick}
        onContextMenu={onContextMenu}
      />
    </div>
  );
};
