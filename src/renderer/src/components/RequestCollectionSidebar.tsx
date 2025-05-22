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
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onReorderRequests: (activeId: string, overId: string) => void;
  onMoveRequestToFolder: (requestId: string, folderId: string | null) => void;
  onAddFolder: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface RequestCollectionSidebarRef {
  triggerDrag?: (activeId: string, overId: string) => void;
  triggerMoveToFolder?: (requestId: string, folderId: string | null) => void;
}

export const RequestCollectionSidebar = forwardRef<
  RequestCollectionSidebarRef,
  RequestCollectionSidebarProps
>(
  (
    {
      savedRequests,
      savedFolders,
      activeRequestId,
      onLoadRequest,
      onDeleteRequest,
      onCopyRequest,
      onReorderRequests,
      onMoveRequestToFolder,
      onAddFolder,
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
        triggerMoveToFolder: (requestId: string, folderId: string | null) => {
          onMoveRequestToFolder(requestId, folderId);
        },
      }),
      [onReorderRequests, onMoveRequestToFolder],
    );

    const folderLookup = React.useMemo(() => {
      const map = new Map<string, string>();
      savedFolders.forEach((f) => {
        f.requestIds.forEach((id) => map.set(id, f.id));
      });
      return map;
    }, [savedFolders]);

    const { setNodeRef: rootDroppableRef } = useDroppable({
      id: 'root',
      data: { type: 'root' },
    });

    const rootRequests = React.useMemo(
      () => savedRequests.filter((r) => !folderLookup.has(r.id)),
      [savedRequests, folderLookup],
    );

    const FolderNode: React.FC<{ folder: SavedFolder }> = ({ folder }) => {
      const [collapsed, setCollapsed] = useState(false);
      const { setNodeRef } = useDroppable({
        id: folder.id,
        data: { type: 'folder' },
      });
      const reqs = folder.requestIds
        .map((id) => savedRequests.find((r) => r.id === id))
        .filter(Boolean) as SavedRequest[];
      const subFolders = folder.subFolderIds
        .map((id) => savedFolders.find((f) => f.id === id))
        .filter(Boolean) as SavedFolder[];
      return (
        <div className="ml-2" key={folder.id}>
          <FolderListItem
            ref={setNodeRef}
            folder={folder}
            isOpen={!collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
          {!collapsed && (
            <div className="ml-4">
              <SortableContext items={reqs.map((r) => r.id)}>
                {reqs.map((req) => (
                  <RequestListItem
                    key={req.id}
                    request={req}
                    isActive={activeRequestId === req.id}
                    onClick={() => onLoadRequest(req)}
                    onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                  />
                ))}
              </SortableContext>
              {subFolders.map((sf) => (
                <FolderNode key={sf.id} folder={sf} />
              ))}
            </div>
          )}
        </div>
      );
    };

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const overType = over.data.current?.type as string | undefined;
        if (overType === 'folder' || overType === 'root') {
          onMoveRequestToFolder(String(active.id), over.id === 'root' ? null : String(over.id));
          return;
        }
        if (active.id === over.id) return;
        onReorderRequests(String(active.id), String(over.id));
      },
      [onMoveRequestToFolder, onReorderRequests],
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
            <div className="flex items-center justify-between mb-[10px]">
              <h2 className="mt-0 text-[1.2em]">{t('collection_title')}</h2>
              <NewFolderButton size="sm" onClick={onAddFolder} />
            </div>
            <div className="flex-grow overflow-y-auto">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
                <div ref={rootDroppableRef}>
                  <SortableContext items={rootRequests.map((r) => r.id)}>
                    {savedRequests.length === 0 && (
                      <p className="text-gray-500">{t('no_saved_requests')}</p>
                    )}
                    {rootRequests.map((req) => (
                      <RequestListItem
                        key={req.id}
                        request={req}
                        isActive={activeRequestId === req.id}
                        onClick={() => onLoadRequest(req)}
                        onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                      />
                    ))}
                  </SortableContext>
                  {savedFolders
                    .filter((f) => f.parentFolderId === null)
                    .map((f) => (
                      <FolderNode key={f.id} folder={f} />
                    ))}
                </div>
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
