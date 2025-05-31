import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KeyValuePair } from '../../types';
import { DragHandleButton } from '../atoms/button/DragHandleButton';
import { TrashButton } from '../atoms/button/TrashButton';
import { UnifiedInput } from '../atoms/form/UnifiedInput';

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
      <UnifiedInput
        value={pair.keyName}
        onChange={(value) => onChange(pair.id, 'keyName', value)}
        placeholder="Key"
        className="w-32"
        disabled={!pair.enabled}
        variant="compact"
      />
      <UnifiedInput
        value={pair.value}
        onChange={(value) => onChange(pair.id, 'value', value)}
        placeholder="Value (JSON or string)"
        className="flex-1"
        disabled={!pair.enabled}
        enableVariables={true}
        variant="compact"
      />
      <TrashButton onClick={() => onRemove(pair.id)} />
    </div>
  );
};

export const BodyKeyValueRow = React.memo(BodyKeyValueRowComponent);

BodyKeyValueRow.displayName = 'BodyKeyValueRow';

export default BodyKeyValueRow;
