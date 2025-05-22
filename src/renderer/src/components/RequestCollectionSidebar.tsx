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
import { useDroppable } from '@dnd-kit/core';
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

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
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
    const { setNodeRef: setRootDroppableRef } = useDroppable({ id: 'folder-root' });

    const toggleFolder = (id: string) => setOpenFolders((o) => ({ ...o, [id]: !o[id] }));

    const FolderItem: React.FC<{ folder: SavedFolder }> = ({ folder }) => {
      const requestsInFolder = savedRequests.filter((r) => r.folderId === folder.id);
      const subFolders = savedFolders.filter((f) => f.parentFolderId === folder.id);
      const { setNodeRef } = useDroppable({ id: `folder-${folder.id}` });
      return (
        <div ref={setNodeRef} className="ml-4">
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => toggleFolder(folder.id)}
          >
            {openFolders[folder.id] ? <FiChevronDown /> : <FiChevronRight />}
            <FiFolder className="mx-1" />
            <span>{folder.name}</span>
          </div>
          {openFolders[folder.id] && (
            <div className="ml-4">
              {requestsInFolder.map((req) => (
                <RequestListItem
                  key={req.id}
                  request={req}
                  isActive={activeRequestId === req.id}
                  onClick={() => onLoadRequest(req)}
                  onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                />
              ))}
              {subFolders.map((sub) => (
                <FolderItem key={sub.id} folder={sub} />
              ))}
            </div>
          )}
        </div>
      );
    };

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
        const overId = String(over.id);
        if (overId === 'folder-root') {
          onMoveRequestToFolder(String(active.id), null);
        } else if (overId.startsWith('folder-')) {
          const folderId = overId.replace('folder-', '');
          onMoveRequestToFolder(String(active.id), folderId);
        } else {
          onReorderRequests(String(active.id), overId);
        }
      },
      [onReorderRequests, onMoveRequestToFolder],
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
            <div className="flex-grow overflow-y-auto" ref={setRootDroppableRef}>
              <NewFolderButton onClick={onAddFolder} className="mb-2 w-full" />
              <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
                <SortableContext items={savedRequests.filter((r) => !r.folderId).map((r) => r.id)}>
                  {savedRequests.filter((r) => !r.folderId).length === 0 && (
                    <p className="text-gray-500">{t('no_saved_requests')}</p>
                  )}
                  {savedRequests
                    .filter((r) => !r.folderId)
                    .map((req) => (
                      <RequestListItem
                        key={req.id}
                        request={req}
                        isActive={activeRequestId === req.id}
                        onClick={() => onLoadRequest(req)}
                        onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                      />
                    ))}
                  {savedFolders
                    .filter((f) => f.parentFolderId === null)
                    .map((folder) => (
                      // eslint-disable-next-line react/prop-types
                      <FolderItem key={folder.id} folder={folder} />
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
