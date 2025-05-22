import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';
import type { SavedRequest } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onReorderRequests: (activeId: string, overId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface RequestCollectionSidebarRef {
  triggerDrag?: (activeId: string, overId: string) => void;
}

export const RequestCollectionSidebar = forwardRef<
  RequestCollectionSidebarRef,
  RequestCollectionSidebarProps
>(
  (
    {
      savedRequests,
      activeRequestId,
      onLoadRequest,
      onDeleteRequest,
      onCopyRequest,
      onReorderRequests,
      isOpen,
      onToggle,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const closeMenu = () => setMenu(null);
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const modifiers = [restrictToParentElement, restrictToWindowEdges];

    useImperativeHandle(
      ref,
      () => ({
        triggerDrag: (activeId: string, overId: string) => {
          onReorderRequests(activeId, overId);
        },
      }),
      [onReorderRequests],
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        onReorderRequests(String(active.id), String(over.id));
      },
      [onReorderRequests],
    );
    return (
      <div
        data-testid="sidebar"
        className={`${
          isOpen ? 'w-[250px]' : 'w-[40px]'
        } flex-shrink-0 border-r border-gray-300 p-2 flex flex-col bg-[var(--color-background)] text-[var(--color-text)] h-screen`}
      >
        <SidebarToggleButton isOpen={isOpen} onClick={onToggle} className="self-end mb-2" />
        {isOpen && (
          <>
            <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
            <div className="flex-grow overflow-y-auto">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
                <SortableContext items={savedRequests.map((r) => r.id)}>
                  {savedRequests.length === 0 && (
                    <p className="text-gray-500">{t('no_saved_requests')}</p>
                  )}
                  {savedRequests.map((req) => (
                    <RequestListItem
                      key={req.id}
                      request={req}
                      isActive={activeRequestId === req.id}
                      onClick={() => onLoadRequest(req)}
                      onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </>
        )}
        {menu && (
          <ContextMenu
            position={{ x: menu.x, y: menu.y }}
            title={t('context_menu_title', {
              name: savedRequests.find((r) => r.id === menu.id)?.name,
            })}
            items={[
              {
                label: t('context_menu_copy_request'),
                onClick: () => onCopyRequest(menu.id),
              },
              {
                label: t('context_menu_delete_request'),
                onClick: () => onDeleteRequest(menu.id),
              },
            ]}
            onClose={closeMenu}
          />
        )}
      </div>
    );
  },
);

RequestCollectionSidebar.displayName = 'RequestCollectionSidebar';
