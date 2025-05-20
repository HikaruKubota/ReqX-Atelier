import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RequestHeader } from '../../types';
import { DragHandleButton } from '../atoms/button/DragHandleButton';
import { MoveUpButton } from '../atoms/button/MoveUpButton';
import { MoveDownButton } from '../atoms/button/MoveDownButton';
import { TrashButton } from '../atoms/button/TrashButton';

export interface HeaderRowProps {
  header: RequestHeader;
  index: number;
  total: number;
  onChange: (id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

const HeaderRowComponent: React.FC<HeaderRowProps> = ({
  header,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <DragHandleButton {...listeners} {...attributes} />
      <input
        type="checkbox"
        checked={header.enabled}
        onChange={(e) => onChange(header.id, 'enabled', e.target.checked)}
        className="mr-1"
      />
      <input
        type="text"
        placeholder="Key"
        value={header.key}
        onChange={(e) => onChange(header.id, 'key', e.target.value)}
        className="w-32 p-2 border border-gray-300 rounded"
        disabled={!header.enabled}
      />
      <input
        type="text"
        placeholder="Value"
        value={header.value}
        onChange={(e) => onChange(header.id, 'value', e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded"
        disabled={!header.enabled}
      />
      <MoveUpButton onClick={() => onMove(index, 'up')} disabled={index === 0} className="mx-1" />
      <MoveDownButton
        onClick={() => onMove(index, 'down')}
        disabled={index === total - 1}
        className="mx-1"
      />
      <TrashButton onClick={() => onRemove(header.id)} />
    </div>
  );
};

export const HeaderRow = React.memo(HeaderRowComponent);

HeaderRow.displayName = 'HeaderRow';

export default HeaderRow;
