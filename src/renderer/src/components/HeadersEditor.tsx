import * as React from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { RequestHeader } from '../types';
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';
import HeaderRow from './molecules/HeaderRow';

interface HeadersEditorProps {
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (
    id: string,
    field: keyof Omit<RequestHeader, 'id'>,
    value: string | boolean,
  ) => void;
  onRemoveHeader: (id: string) => void;
  onMoveHeader: (activeId: string, overId: string) => void;
}

export const HeadersEditor: React.FC<HeadersEditorProps> = ({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  onMoveHeader,
}) => {
  const modifiers = [restrictToParentElement, restrictToWindowEdges];

  const handleMove = React.useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index > 0) {
        onMoveHeader(headers[index].id, headers[index - 1].id);
      } else if (direction === 'down' && index < headers.length - 1) {
        onMoveHeader(headers[index].id, headers[index + 1].id);
      }
    },
    [headers, onMoveHeader],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onMoveHeader(String(active.id), String(over.id));
    },
    [onMoveHeader],
  );

  return (
    <div className="flex flex-col gap-2">
      <h4>Headers</h4>
      <DndContext onDragEnd={handleDragEnd} modifiers={modifiers}>
        <SortableContext items={headers}>
          {headers.map((header, index) => (
            <HeaderRow
              key={header.id}
              header={header}
              index={index}
              total={headers.length}
              onChange={onUpdateHeader}
              onRemove={onRemoveHeader}
              onMove={handleMove}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={onAddHeader}
        className="px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded self-start"
      >
        Add Header
      </button>
    </div>
  );
};
