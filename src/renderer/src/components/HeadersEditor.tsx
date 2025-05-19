/* eslint-disable react/prop-types */
import * as React from 'react';
import { useCallback } from 'react';
import type { RequestHeader } from '../types';
import { TrashButton } from './atoms/button/TrashButton';
import { DragHandleButton } from './atoms/button/DragHandleButton';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

interface HeadersEditorProps {
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (
    id: string,
    field: keyof Omit<RequestHeader, 'id'>,
    value: string | boolean,
  ) => void;
  onRemoveHeader: (id: string) => void;
  onReorderHeaders: React.Dispatch<React.SetStateAction<RequestHeader[]>>;
}

export const HeadersEditor: React.FC<HeadersEditorProps> = ({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  onReorderHeaders,
}) => {
  const { t } = useTranslation();
  const headerIdsRef = React.useRef<string[]>([]);
  const orderRef = React.useRef('');
  const currentOrder = headers.map((h) => h.id).join(',');
  if (orderRef.current !== currentOrder) {
    orderRef.current = currentOrder;
    headerIdsRef.current = headers.map((h) => h.id);
  }
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onReorderHeaders((prev) => {
        const oldIndex = prev.findIndex((h) => h.id === active.id);
        const newIndex = prev.findIndex((h) => h.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [onReorderHeaders],
  );

  const SortableRow: React.FC<{ header: RequestHeader }> = ({ header }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: header.id,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2">
        <DragHandleButton {...listeners} {...attributes} className="mx-1" />
        <input
          type="checkbox"
          checked={header.enabled}
          onChange={(e) => onUpdateHeader(header.id, 'enabled', e.target.checked)}
          title={header.enabled ? 'Disable header' : 'Enable header'}
          className="mr-1"
        />
        <input
          type="text"
          placeholder="Key"
          value={header.key}
          onChange={(e) => onUpdateHeader(header.id, 'key', e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded"
          disabled={!header.enabled}
        />
        <input
          type="text"
          placeholder="Value"
          value={header.value}
          onChange={(e) => onUpdateHeader(header.id, 'value', e.target.value)}
          className="flex-2 p-2 border border-gray-300 rounded"
          disabled={!header.enabled}
        />
        <TrashButton onClick={() => onRemoveHeader(header.id)} />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <h4>Headers</h4>
      <DndContext onDragEnd={handleDragEnd} data-testid="headers-dnd">
        <SortableContext items={headerIdsRef.current} strategy={verticalListSortingStrategy}>
          {headers.map((header) => (
            <SortableRow key={header.id} header={header} />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={onAddHeader}
        className="px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded self-start"
      >
        {t('add_header') || 'Add Header'}
      </button>
    </div>
  );
};
