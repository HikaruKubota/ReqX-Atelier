import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onMoveRequest: (requestId: string, folderId: string | null) => void;
  onReorderRequest: (folderId: string | null, activeId: string, overId: string) => void;
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
  onMoveRequest,
  onReorderRequest,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const closeMenu = () => setMenu(null);
  const toggleFolder = (id: string) => setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  const findFolderForRequest = (id: string): string | null => {
    const f = savedFolders.find((fo) => fo.requestIds.includes(id));
    return f ? f.id : null;
  };
  const renderFolder = (folder: SavedFolder, depth = 0) => (
    <FolderListItem
      key={folder.id}
      folder={folder}
      depth={depth}
      isOpen={openFolders[folder.id]}
      onToggle={() => toggleFolder(folder.id)}
    >
      {folder.requestIds.map((rid) => {
        const req = savedRequests.find((r) => r.id === rid);
        if (!req) return null;
        return (
          <RequestListItem
            key={req.id}
            request={req}
            isActive={activeRequestId === req.id}
            onClick={() => onLoadRequest(req)}
            onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
          />
        );
      })}
      {folder.subFolderIds.map((sid) => {
        const child = savedFolders.find((f) => f.id === sid);
        return child ? renderFolder(child, depth + 1) : null;
      })}
    </FolderListItem>
  );
  const rootRequests = savedRequests.filter(
    (r) => !savedFolders.some((f) => f.requestIds.includes(r.id)),
  );
  const rootFolders = savedFolders.filter((f) => f.parentFolderId === null);
  const { setNodeRef: setRootRef } = useDroppable({ id: 'root' });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (!activeId.startsWith('req-')) return;
    const reqId = activeId.slice(4);
    if (overId.startsWith('req-')) {
      const overReqId = overId.slice(4);
      const folderId = findFolderForRequest(reqId);
      const overFolderId = findFolderForRequest(overReqId);
      if (folderId === overFolderId) {
        onReorderRequest(folderId, reqId, overReqId);
      }
    } else if (overId.startsWith('folder-')) {
      const folderId = overId.slice(7);
      onMoveRequest(reqId, folderId);
    } else if (overId === 'root') {
      onMoveRequest(reqId, null);
    }
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
        <DndContext onDragEnd={handleDragEnd}>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <div className="flex-grow overflow-y-auto" id="root-drop">
            {rootRequests.length === 0 && savedFolders.length === 0 && (
              <p className="text-gray-500">{t('no_saved_requests')}</p>
            )}
            <div ref={setRootRef} data-id="root" className="min-h-[20px]" />
            {rootRequests.map((req) => (
              <RequestListItem
                key={req.id}
                request={req}
                isActive={activeRequestId === req.id}
                onClick={() => onLoadRequest(req)}
                onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
              />
            ))}
            {rootFolders.map((f) => renderFolder(f))}
          </div>
        </DndContext>
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
