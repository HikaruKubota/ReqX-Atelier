import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddRequest: (req: Omit<SavedRequest, 'id'>) => string;
  onAddFolder: (folder: Omit<SavedFolder, 'id'>) => string;
  onUpdateFolder: (id: string, updated: Partial<Omit<SavedFolder, 'id'>>) => void;
  onDeleteFolder: (id: string) => void;
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
  onAddRequest,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{
    id: string;
    type: 'request' | 'folder';
    x: number;
    y: number;
  } | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const closeMenu = () => setMenu(null);

  const folderMap = Object.fromEntries(savedFolders.map((f) => [f.id, f]));

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const handleCreateFolder = (parentId: string | null) => {
    const name = prompt(t('prompt_folder_name'));
    if (!name) return;
    const newId = onAddFolder({
      name,
      parentFolderId: parentId,
      requestIds: [],
      subFolderIds: [],
    });
    if (parentId) {
      const parent = folderMap[parentId];
      if (parent) {
        onUpdateFolder(parentId, {
          subFolderIds: [...parent.subFolderIds, newId],
        });
        setOpenFolders((prev) => new Set(prev).add(parentId));
      }
    }
  };

  const handleCreateRequest = (folderId: string) => {
    const newId = onAddRequest({
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      headers: [],
      body: [],
      params: [],
    });
    const folder = folderMap[folderId];
    if (folder) {
      onUpdateFolder(folderId, {
        requestIds: [...folder.requestIds, newId],
      });
    }
  };

  const handleRenameFolder = (id: string) => {
    const folder = folderMap[id];
    if (!folder) return;
    const name = prompt(t('prompt_folder_name'), folder.name);
    if (name) onUpdateFolder(id, { name });
  };

  const handleRemoveFolder = (id: string) => {
    if (!confirm(t('delete_folder_confirm'))) return;
    const folder = folderMap[id];
    if (folder?.parentFolderId) {
      const parent = folderMap[folder.parentFolderId];
      if (parent) {
        onUpdateFolder(folder.parentFolderId, {
          subFolderIds: parent.subFolderIds.filter((fid) => fid !== id),
        });
      }
    }
    onDeleteFolder(id);
  };

  const folderRequestIds = new Set(savedFolders.flatMap((f) => f.requestIds));
  const rootFolders = savedFolders
    .filter((f) => !f.parentFolderId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const rootRequests = savedRequests
    .filter((r) => !folderRequestIds.has(r.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderFolder = (folder: SavedFolder): React.ReactNode => {
    const isOpenFolder = openFolders.has(folder.id);
    const subFolders = folder.subFolderIds
      .map((id) => folderMap[id])
      .filter((f): f is SavedFolder => !!f)
      .sort((a, b) => a.name.localeCompare(b.name));
    const requestsInFolder = folder.requestIds
      .map((id) => savedRequests.find((r) => r.id === id))
      .filter((r): r is SavedRequest => !!r)
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <div key={folder.id}>
        <FolderListItem
          folder={folder}
          isOpen={isOpenFolder}
          onToggle={() => toggleFolder(folder.id)}
          onContextMenu={(e) =>
            setMenu({ id: folder.id, type: 'folder', x: e.clientX, y: e.clientY })
          }
        />
        {isOpenFolder && (
          <div className="ml-4">
            {subFolders.map((sf) => renderFolder(sf))}
            {requestsInFolder.map((req) => (
              <RequestListItem
                key={req.id}
                request={req}
                isActive={activeRequestId === req.id}
                onClick={() => onLoadRequest(req)}
                onContextMenu={(e) =>
                  setMenu({
                    id: req.id,
                    type: 'request',
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div
      data-testid="sidebar"
      className={`${
        isOpen ? 'w-[250px]' : 'w-[40px]'
      } flex-shrink-0 border-r border-gray-300 p-2 flex flex-col bg-[var(--color-background)] text-[var(--color-text)] h-screen`}
    >
      <div className="flex justify-between items-center mb-2">
        <SidebarToggleButton isOpen={isOpen} onClick={onToggle} />
        {isOpen && <NewFolderButton onClick={() => handleCreateFolder(null)} />}
      </div>
      {isOpen && (
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <div className="flex-grow overflow-y-auto">
            {rootFolders.length === 0 && rootRequests.length === 0 && (
              <p className="text-gray-500">{t('no_saved_requests')}</p>
            )}
            {rootFolders.map((f) => renderFolder(f))}
            {rootRequests.map((req) => (
              <RequestListItem
                key={req.id}
                request={req}
                isActive={activeRequestId === req.id}
                onClick={() => onLoadRequest(req)}
                onContextMenu={(e) =>
                  setMenu({ id: req.id, type: 'request', x: e.clientX, y: e.clientY })
                }
              />
            ))}
          </div>
        </>
      )}
      {menu && (
        <ContextMenu
          position={{ x: menu.x, y: menu.y }}
          title={t('context_menu_title', {
            name:
              menu.type === 'request'
                ? savedRequests.find((r) => r.id === menu.id)?.name
                : folderMap[menu.id]?.name,
          })}
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
                    label: t('context_menu_new_folder'),
                    onClick: () => handleCreateFolder(menu.id),
                  },
                  {
                    label: t('context_menu_new_request'),
                    onClick: () => handleCreateRequest(menu.id),
                  },
                  {
                    label: t('context_menu_rename_folder'),
                    onClick: () => handleRenameFolder(menu.id),
                  },
                  {
                    label: t('context_menu_delete_folder'),
                    onClick: () => handleRemoveFolder(menu.id),
                  },
                ]
          }
          onClose={closeMenu}
        />
      )}
    </div>
  );
};
