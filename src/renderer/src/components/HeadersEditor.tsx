import * as React from 'react';
import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useTranslation } from 'react-i18next';
import type { RequestHeader } from '../types';
import { HeaderRow } from './molecules/HeaderRow';

interface HeadersEditorProps {
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (
    id: string,
    field: keyof Omit<RequestHeader, 'id'>,
    value: string | boolean,
  ) => void;
  onRemoveHeader: (id: string) => void;
  onReorderHeaders: (newHeaders: RequestHeader[]) => void;
}

export interface HeadersEditorRef {
  triggerDrag?: (activeId: string, overId: string) => void;
}

export const HeadersEditor = forwardRef<HeadersEditorRef, HeadersEditorProps>(
  ({ headers, onAddHeader, onUpdateHeader, onRemoveHeader, onReorderHeaders }, ref) => {
    const { t } = useTranslation();
    const modifiers = [restrictToParentElement, restrictToWindowEdges];

    useImperativeHandle(
      ref,
      () => ({
        triggerDrag: (activeId: string, overId: string) => {
          const oldIndex = headers.findIndex((h) => h.id === activeId);
          const newIndex = headers.findIndex((h) => h.id === overId);
          if (oldIndex === -1 || newIndex === -1) return;
          onReorderHeaders(arrayMove(headers, oldIndex, newIndex));
        },
      }),
      [headers, onReorderHeaders],
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = headers.findIndex((h) => h.id === active.id);
        const newIndex = headers.findIndex((h) => h.id === over.id);
        onReorderHeaders(arrayMove(headers, oldIndex, newIndex));
      },
      [headers, onReorderHeaders],
    );

    return (
      <div className="flex flex-col gap-4">
        <DndContext onDragEnd={handleDragEnd} modifiers={modifiers}>
          <SortableContext items={headers}>
            {headers.map((header) => (
              <HeaderRow
                key={header.id}
                header={header}
                onChange={onUpdateHeader}
                onRemove={onRemoveHeader}
              />
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
  },
);

HeadersEditor.displayName = 'HeadersEditor';
