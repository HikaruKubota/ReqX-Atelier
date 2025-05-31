import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RequestHeader } from '../../types';
import { DragHandleButton } from '../atoms/button/DragHandleButton';
import { TrashButton } from '../atoms/button/TrashButton';
import { UnifiedInput } from '../atoms/form/UnifiedInput';

export interface HeaderRowProps {
  header: RequestHeader;
  onChange: (id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => void;
  onRemove: (id: string) => void;
}

const HeaderRowComponent: React.FC<HeaderRowProps> = ({ header, onChange, onRemove }) => {
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
      <UnifiedInput
        value={header.key}
        onChange={(value) => onChange(header.id, 'key', value)}
        placeholder="Key"
        className="w-32 text-sm"
        disabled={!header.enabled}
        variant="compact"
      />
      <UnifiedInput
        value={header.value}
        onChange={(value) => onChange(header.id, 'value', value)}
        placeholder="Value"
        className="flex-1 text-sm"
        disabled={!header.enabled}
        enableVariables={true}
        variant="compact"
      />
      <TrashButton onClick={() => onRemove(header.id)} />
    </div>
  );
};

export const HeaderRow = React.memo(HeaderRowComponent);

HeaderRow.displayName = 'HeaderRow';

export default HeaderRow;
