import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { DndContext, type DragEndEvent, useDroppable } from '@dnd-kit/core';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onNewFolder: (parentId: string | null) => void;
  onMoveRequest: (id: string, folderId: string | null) => void;
  onMoveFolder: (id: string, targetFolderId: string | null) => void;
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
  onDeleteFolder,
  onRenameFolder,
  onNewFolder,
  onMoveRequest,
  onMoveFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{
    type: 'request' | 'folder';
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const closeMenu = () => setMenu(null);
  const rootFolders = savedFolders
    .filter((f) => f.parentFolderId === null)
    .sort((a, b) => a.name.localeCompare(b.name));
  const rootRequests = savedRequests
    .filter((r) => !savedFolders.some((f) => f.requestIds.includes(r.id)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const { setNodeRef: rootDropRef } = useDroppable({ id: 'root' });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const [type] = String(active.id).split('-');
    const [, overId] = String(over.id).split('-');
    if (type === 'request') {
      onMoveRequest(String(active.id).replace('request-', ''), overId === 'root' ? null : overId);
    } else if (type === 'folder') {
      if (over.id === active.id) return;
      onMoveFolder(String(active.id).replace('folder-', ''), overId === 'root' ? null : overId);
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
          <DndContext onDragEnd={handleDragEnd}>
            <div
              className="flex-grow overflow-y-auto"
              ref={rootDropRef}
              onContextMenu={(e) => {
                if (e.currentTarget === e.target) {
                  e.preventDefault();
                  setMenu({ type: 'folder', id: 'root', x: e.clientX, y: e.clientY });
                }
              }}
            >
              {rootFolders.map((folder) => (
                <FolderListItem
                  key={folder.id}
                  folder={folder}
                  folders={savedFolders}
                  requests={savedRequests}
                  activeRequestId={activeRequestId}
                  onLoadRequest={onLoadRequest}
                  onContextMenu={(id, x, y) => setMenu({ type: 'folder', id, x, y })}
                  dragId={`folder-${folder.id}`}
                />
              ))}
              {rootRequests.length === 0 && rootFolders.length === 0 && (
                <p className="text-gray-500">{t('no_saved_requests')}</p>
              )}
              {rootRequests.map((req) => (
                <RequestListItem
                  key={req.id}
                  request={req}
                  isActive={activeRequestId === req.id}
                  onClick={() => onLoadRequest(req)}
                  onContextMenu={(e) =>
                    setMenu({ type: 'request', id: req.id, x: e.clientX, y: e.clientY })
                  }
                  draggableId={`request-${req.id}`}
                />
              ))}
            </div>
          </DndContext>
        </>
      )}
      {menu && (
        <ContextMenu
          position={{ x: menu.x, y: menu.y }}
          title={
            menu.type === 'request'
              ? t('context_menu_title', {
                  name: savedRequests.find((r) => r.id === menu.id)?.name,
                })
              : savedFolders.find((f) => f.id === menu.id)?.name || ''
          }
          items={
            menu.type === 'request'
              ? [
                  {
                    label: t('context_menu_copy_request'),
                    onClick: () => onCopyRequest(menu.id),
                  },
                  {
                    label: t('context_menu_delete_request'),
                    onClick: () => onDeleteRequest(menu.id),
                  },
                ]
              : [
                  {
                    label: t('new_folder'),
                    onClick: () => onNewFolder(menu.id === 'root' ? null : menu.id),
                  },
                  {
                    label: t('context_menu_rename_folder'),
                    onClick: () => {
                      const name = prompt(t('rename_folder_prompt'));
                      if (name) onRenameFolder(menu.id, name);
                    },
                  },
                  {
                    label: t('context_menu_delete_folder'),
                    onClick: () => onDeleteFolder(menu.id),
                  },
                ]
          }
          onClose={closeMenu}
        />
      )}
    </div>
  );
};
