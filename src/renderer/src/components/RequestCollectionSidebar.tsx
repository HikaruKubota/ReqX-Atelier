import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { DraggableRequestListItem } from './atoms/list/DraggableRequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useSavedRequestsStore } from '../store/savedRequestsStore';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [folderMenu, setFolderMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [rootMenu, setRootMenu] = useState<{ x: number; y: number } | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const savedFolders = useSavedRequestsStore((s) => s.savedFolders);
  const addFolder = useSavedRequestsStore((s) => s.addFolder);
  const updateFolder = useSavedRequestsStore((s) => s.updateFolder);
  const deleteFolder = useSavedRequestsStore((s) => s.deleteFolder);
  const moveRequestToFolder = useSavedRequestsStore((s) => s.moveRequestToFolder);
  const moveFolderToFolder = useSavedRequestsStore((s) => s.moveFolderToFolder);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const closeMenu = () => setMenu(null);
  const closeFolderMenu = () => setFolderMenu(null);
  const closeRootMenu = () => setRootMenu(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const activeId = String(active.id);
    if (activeId.startsWith('req-')) {
      const reqId = activeId.slice(4);
      const folderId = overId.startsWith('folder-') ? overId.slice(7) : null;
      moveRequestToFolder(reqId, folderId);
    } else if (activeId.startsWith('folder-')) {
      const folder = activeId.slice(7);
      const target = overId.startsWith('folder-') ? overId.slice(7) : null;
      if (folder !== target) moveFolderToFolder(folder, target);
    }
  };
  const sortFolders = (a: SavedFolder, b: SavedFolder) => a.name.localeCompare(b.name);
  const sortRequests = (a: SavedRequest, b: SavedRequest) => a.name.localeCompare(b.name);

  const renderFolder = (folder: SavedFolder, depth: number) => {
    const open = openFolders[folder.id] ?? true;
    const toggle = () => setOpenFolders((o) => ({ ...o, [folder.id]: !open }));
    const subFolders = folder.subFolderIds
      .map((id) => savedFolders.find((f) => f.id === id))
      .filter((f): f is SavedFolder => !!f)
      .sort(sortFolders);
    const reqs = folder.requestIds
      .map((id) => savedRequests.find((r) => r.id === id))
      .filter((r): r is SavedRequest => !!r)
      .sort(sortRequests);
    return (
      <div key={folder.id}>
        <FolderListItem
          folder={folder}
          depth={depth}
          open={open}
          onToggle={toggle}
          onContextMenu={(e) => setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY })}
        />
        {open && (
          <>
            {subFolders.map((f) => renderFolder(f, depth + 1))}
            {reqs.map((r) => (
              <DraggableRequestListItem
                key={r.id}
                request={r}
                depth={depth + 1}
                isActive={activeRequestId === r.id}
                onClick={() => onLoadRequest(r)}
                onContextMenu={(e) => setMenu({ id: r.id, x: e.clientX, y: e.clientY })}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  const rootFolders = savedFolders.filter((f) => f.parentFolderId === null).sort(sortFolders);
  const requestsInFolders = new Set(savedFolders.flatMap((f) => f.requestIds));
  const rootRequests = savedRequests.filter((r) => !requestsInFolders.has(r.id)).sort(sortRequests);

  return (
    <div
      data-testid="sidebar"
      className={`${
        isOpen ? 'w-[250px]' : 'w-[40px]'
      } flex-shrink-0 border-r border-gray-300 p-2 flex flex-col bg-[var(--color-background)] text-[var(--color-text)] h-screen`}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          setRootMenu({ x: e.clientX, y: e.clientY });
        }
      }}
    >
      <SidebarToggleButton isOpen={isOpen} onClick={onToggle} className="self-end mb-2" />
      {isOpen && (
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex-grow overflow-y-auto" id="sidebar-root" data-testid="sidebar-root">
              {rootFolders.length === 0 && rootRequests.length === 0 && (
                <p className="text-gray-500">{t('no_saved_requests')}</p>
              )}
              {rootFolders.map((f) => renderFolder(f, 0))}
              {rootRequests.map((r) => (
                <DraggableRequestListItem
                  key={r.id}
                  request={r}
                  depth={0}
                  isActive={activeRequestId === r.id}
                  onClick={() => onLoadRequest(r)}
                  onContextMenu={(e) => setMenu({ id: r.id, x: e.clientX, y: e.clientY })}
                />
              ))}
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
      {folderMenu && (
        <ContextMenu
          position={{ x: folderMenu.x, y: folderMenu.y }}
          title={t('context_menu_title', {
            name: savedFolders.find((f) => f.id === folderMenu.id)?.name,
          })}
          items={[
            {
              label: t('context_menu_rename_folder'),
              onClick: () => {
                const name = prompt(t('prompt_folder_name') || 'Folder Name');
                if (name) updateFolder(folderMenu.id, { name });
              },
            },
            {
              label: t('context_menu_delete_folder'),
              onClick: () => deleteFolder(folderMenu.id),
            },
          ]}
          onClose={closeFolderMenu}
        />
      )}
      {rootMenu && (
        <ContextMenu
          position={{ x: rootMenu.x, y: rootMenu.y }}
          items={[
            {
              label: t('context_menu_new_folder'),
              onClick: () => {
                const name = prompt(t('prompt_folder_name') || 'Folder');
                if (!name) return;
                addFolder({ name, parentFolderId: null, requestIds: [], subFolderIds: [] });
              },
            },
          ]}
          onClose={closeRootMenu}
        />
      )}
    </div>
  );
};
