import React, { useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
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
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onAddFolder: () => void;
  onCopyRequest: (id: string) => void;
  onReorderRequests: (activeId: string, overId: string) => void;
  onMoveRequestToFolder: (requestId: string, folderId: string) => void;
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
      onDeleteFolder,
      onAddFolder,
      onCopyRequest,
      onReorderRequests,
      onMoveRequestToFolder,
      isOpen,
      onToggle,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const [folderMenu, setFolderMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const closeMenu = () => setMenu(null);
    const closeFolderMenu = () => setFolderMenu(null);
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
        if (!over) return;
        const overType = over.data.current?.type;
        if (overType === 'folder') {
          onMoveRequestToFolder(String(active.id), String(over.id));
          return;
        }
        if (active.id !== over.id) {
          onReorderRequests(String(active.id), String(over.id));
        }
      },
      [onMoveRequestToFolder, onReorderRequests],
    );

    const requestFolderMap = useMemo(() => {
      const m = new Map<string, string>();
      savedFolders.forEach((f) => {
        f.requestIds.forEach((id) => m.set(id, f.id));
      });
      return m;
    }, [savedFolders]);

    const rootRequests = useMemo(
      () => savedRequests.filter((r) => !requestFolderMap.has(r.id)),
      [savedRequests, requestFolderMap],
    );

    const toggleFolder = (id: string) => {
      setCollapsed((c) => ({ ...c, [id]: !c[id] }));
    };

    const renderFolder = (folder: SavedFolder, depth = 0): React.ReactNode => {
      const requests = folder.requestIds
        .map((rid) => savedRequests.find((r) => r.id === rid))
        .filter(Boolean) as SavedRequest[];
      const children = savedFolders.filter((f) => f.parentFolderId === folder.id);
      return (
        <FolderListItem
          key={folder.id}
          folder={folder}
          depth={depth}
          collapsed={collapsed[folder.id]}
          onToggle={toggleFolder}
          onContextMenu={(e) => setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY })}
        >
          {children.map((child) => renderFolder(child, depth + 1))}
          <SortableContext items={requests.map((r) => r.id)}>
            {requests.map((req) => (
              <RequestListItem
                key={req.id}
                request={req}
                isActive={activeRequestId === req.id}
                onClick={() => onLoadRequest(req)}
                onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
              />
            ))}
          </SortableContext>
        </FolderListItem>
      );
    };
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="mt-0 text-[1.2em]">{t('collection_title')}</h2>
              <NewFolderButton onClick={onAddFolder} size="sm" />
            </div>
            <div className="flex-grow overflow-y-auto">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
                {savedFolders.filter((f) => f.parentFolderId === null).map((f) => renderFolder(f))}
                <SortableContext items={rootRequests.map((r) => r.id)}>
                  {rootRequests.length === 0 && savedFolders.length === 0 && (
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
        {folderMenu && (
          <ContextMenu
            position={{ x: folderMenu.x, y: folderMenu.y }}
            title={t('context_menu_title', {
              name: savedFolders.find((f) => f.id === folderMenu.id)?.name,
            })}
            items={[
              {
                label: t('context_menu_delete_folder'),
                onClick: () => onDeleteFolder(folderMenu.id),
              },
            ]}
            onClose={closeFolderMenu}
          />
        )}
      </div>
    );
  },
);

RequestCollectionSidebar.displayName = 'RequestCollectionSidebar';
