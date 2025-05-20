import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KeyValuePair } from '../../types';
import { DragHandleButton } from '../atoms/button/DragHandleButton';
import { TrashButton } from '../atoms/button/TrashButton';

export interface BodyKeyValueRowProps {
  pair: KeyValuePair;
  onChange: (id: string, field: keyof Omit<KeyValuePair, 'id'>, value: string | boolean) => void;
  onRemove: (id: string) => void;
}

const BodyKeyValueRowComponent: React.FC<BodyKeyValueRowProps> = ({ pair, onChange, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: pair.id,
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
        checked={pair.enabled}
        onChange={(e) => onChange(pair.id, 'enabled', e.target.checked)}
        className="mr-1"
      />
      <input
        type="text"
        placeholder="Key"
        value={pair.keyName}
        onChange={(e) => onChange(pair.id, 'keyName', e.target.value)}
        className="w-32 p-2 text-sm border border-gray-300 rounded"
        disabled={!pair.enabled}
      />
      <input
        type="text"
        placeholder="Value (JSON or string)"
        value={pair.value}
        onChange={(e) => onChange(pair.id, 'value', e.target.value)}
        className="flex-1 p-2 text-sm border border-gray-300 rounded"
        disabled={!pair.enabled}
      />
      <TrashButton onClick={() => onRemove(pair.id)} />
    </div>
  );
};

export const BodyKeyValueRow = React.memo(BodyKeyValueRowComponent);

BodyKeyValueRow.displayName = 'BodyKeyValueRow';

export default BodyKeyValueRow;
