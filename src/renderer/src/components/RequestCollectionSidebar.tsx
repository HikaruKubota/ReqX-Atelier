import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: () => void;
  onMoveRequest: (id: string, folderId: string | null) => void;
  onReorderRoot: (activeId: string, overId: string) => void;
  onReorderFolder: (folderId: string, activeId: string, overId: string) => void;
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
  onMoveRequest,
  onReorderRoot,
  onReorderFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleFolder = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const folderMap = Object.fromEntries(savedFolders.map((f) => [f.id, f]));
  const requestMap = Object.fromEntries(savedRequests.map((r) => [r.id, r]));
  const requestsInFolder = new Set<string>();
  savedFolders.forEach((f) => f.requestIds.forEach((id) => requestsInFolder.add(id)));
  const rootRequests = savedRequests.filter((r) => !requestsInFolder.has(r.id));
  const rootFolders = savedFolders.filter((f) => !f.parentFolderId);

  const renderFolder = (folderId: string) => {
    const folder = folderMap[folderId];
    if (!folder) return null;
    const isCol = collapsed[folderId] ?? false;
    return (
      <div key={folderId} className="ml-2" data-folder-id={folderId}>
        <FolderListItem folder={folder} collapsed={isCol} onToggle={() => toggleFolder(folderId)} />
        {!isCol && (
          <div className="ml-4">
            <SortableContext items={folder.requestIds}>
              {folder.requestIds.map((rid) => {
                const req = requestMap[rid];
                return (
                  req && (
                    <RequestListItem
                      key={req.id}
                      request={req}
                      containerId={folderId}
                      isActive={activeRequestId === req.id}
                      onClick={() => onLoadRequest(req)}
                      onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                    />
                  )
                );
              })}
            </SortableContext>
            {folder.subFolderIds.map((sub) => renderFolder(sub))}
          </div>
        )}
      </div>
    );
  };

  const closeMenu = () => setMenu(null);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as { type: string; folderId?: string };
    const overData = over.data.current as { type: string; folderId?: string };
    if (!activeData || activeData.type !== 'request') return;
    const activeId = String(active.id);
    if (overData?.type === 'folder') {
      onMoveRequest(activeId, String(over.id));
      return;
    }
    if (overData?.type === 'request') {
      const overId = String(over.id);
      if (activeData.folderId === overData.folderId) {
        if (activeData.folderId) {
          onReorderFolder(activeData.folderId, activeId, overId);
        } else {
          onReorderRoot(activeId, overId);
        }
      } else {
        onMoveRequest(activeId, overData.folderId || null);
      }
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
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <NewFolderButton onClick={onAddFolder} className="mb-2" />
          <div className="flex-grow overflow-y-auto">
            {savedRequests.length === 0 && savedFolders.length === 0 && (
              <p className="text-gray-500">{t('no_saved_requests')}</p>
            )}
            <DndContext onDragEnd={handleDragEnd}>
              {rootFolders.map((f) => renderFolder(f.id))}
              <SortableContext items={rootRequests.map((r) => r.id)}>
                {rootRequests.map((req) => (
                  <RequestListItem
                    key={req.id}
                    request={req}
                    containerId={null}
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
};
