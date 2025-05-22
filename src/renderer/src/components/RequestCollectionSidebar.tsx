import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { SortableRequestListItem } from './atoms/list/SortableRequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: () => void;
  onMoveRequestToFolder: (requestId: string, folderId: string | null) => void;
  onReorderRequests: (folderId: string | null, activeId: string, overId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  savedFolders,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onMoveRequestToFolder,
  onReorderRequests,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );
  const modifiers = [restrictToParentElement];
  const toggleFolder = (id: string) => setOpenFolders((p) => ({ ...p, [id]: !p[id] }));

  const folderMap = Object.fromEntries(savedFolders.map((f) => [f.id, f]));
  const requestFolderSet = new Set(savedFolders.flatMap((f) => f.requestIds));
  const rootRequests = savedRequests.filter((r) => !requestFolderSet.has(r.id));
  const rootFolders = savedFolders.filter((f) => f.parentFolderId === null);
  const findFolderId = (reqId: string): string | null => {
    const f = savedFolders.find((fl) => fl.requestIds.includes(reqId));
    return f ? f.id : null;
  };

  const renderFolder = (folder: SavedFolder): React.ReactNode => {
    const open = openFolders[folder.id] ?? true;
    const requests = folder.requestIds
      .map((id) => savedRequests.find((r) => r.id === id))
      .filter(Boolean) as SavedRequest[];
    const subFolders = folder.subFolderIds.map((id) => folderMap[id]).filter(Boolean);
    return (
      <FolderListItem
        key={folder.id}
        folder={folder}
        open={open}
        onToggle={() => toggleFolder(folder.id)}
      >
        {subFolders.map((sf) => renderFolder(sf))}
        <SortableContext items={requests.map((r) => r.id)}>
          {requests.map((req) => (
            <SortableRequestListItem
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (overId.startsWith('folder-')) {
      onMoveRequestToFolder(activeId, overId.replace('folder-', ''));
      return;
    }
    const overFolderId = findFolderId(overId);
    const activeFolderId = findFolderId(activeId);
    if (overFolderId === activeFolderId) {
      onReorderRequests(overFolderId, activeId, overId);
    } else {
      onMoveRequestToFolder(activeId, overFolderId);
      if (overFolderId) {
        onReorderRequests(overFolderId, activeId, overId);
      }
    }
  };
  const closeMenu = () => setMenu(null);
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
          <NewFolderButton onClick={onAddFolder} className="mb-2" />
          <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
            <div className="flex-grow overflow-y-auto">
              <SortableContext items={rootRequests.map((r) => r.id)}>
                {rootRequests.map((req) => (
                  <SortableRequestListItem
                    key={req.id}
                    request={req}
                    isActive={activeRequestId === req.id}
                    onClick={() => onLoadRequest(req)}
                    onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                  />
                ))}
              </SortableContext>
              {rootFolders.map((f) => renderFolder(f))}
            </div>
          </DndContext>
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
};
