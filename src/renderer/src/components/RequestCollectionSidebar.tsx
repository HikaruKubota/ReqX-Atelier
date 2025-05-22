import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderIconButton } from './atoms/button/NewFolderIconButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useSavedRequests } from '../hooks/useSavedRequests';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onNewRequest: () => void;
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
  onNewRequest,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [folderMenu, setFolderMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { addFolder, updateFolder, deleteFolder } = useSavedRequests();
  const closeMenu = () => setMenu(null);
  const closeFolderMenu = () => setFolderMenu(null);

  const toggleFolder = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  };

  const handleAddFolder = (parentId: string | null) => {
    const name = prompt(t('new_folder')) || t('untitled_folder');
    const newId = addFolder({ name, parentFolderId: parentId, requestIds: [], subFolderIds: [] });
    if (parentId) {
      const parent = savedFolders.find((f) => f.id === parentId);
      if (parent) {
        updateFolder(parentId, { subFolderIds: [...parent.subFolderIds, newId] });
        setExpanded((e) => ({ ...e, [parentId]: true }));
      }
    }
  };

  const handleRenameFolder = (id: string) => {
    const folder = savedFolders.find((f) => f.id === id);
    if (!folder) return;
    const name = prompt(t('context_menu_rename_folder'), folder.name);
    if (name && name.trim() !== '') {
      updateFolder(id, { name });
    }
  };

  const handleDeleteFolder = (id: string) => {
    if (!confirm(t('delete_confirm'))) return;
    const folder = savedFolders.find((f) => f.id === id);
    if (folder && folder.parentFolderId) {
      const parent = savedFolders.find((f) => f.id === folder.parentFolderId);
      if (parent) {
        updateFolder(parent.id, {
          subFolderIds: parent.subFolderIds.filter((fid) => fid !== id),
        });
      }
    }
    deleteFolder(id);
  };

  const allFolderRequestIds = new Set(savedFolders.flatMap((f) => f.requestIds));
  const rootRequests = savedRequests
    .filter((r) => !allFolderRequestIds.has(r.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderFolder = (folderId: string, depth: number) => {
    const folder = savedFolders.find((f) => f.id === folderId);
    if (!folder) return null;
    const isOpen = !!expanded[folderId];
    return (
      <div key={folder.id}>
        <FolderListItem
          folder={folder}
          depth={depth}
          isOpen={isOpen}
          onToggle={() => toggleFolder(folder.id)}
          onContextMenu={(e) => setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY })}
        />
        {isOpen && (
          <div>
            {folder.subFolderIds
              .map((id) => savedFolders.find((f) => f.id === id))
              .filter((f): f is SavedFolder => !!f)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((sub) => renderFolder(sub.id, depth + 1))}
            {folder.requestIds
              .map((id) => savedRequests.find((r) => r.id === id))
              .filter((r): r is SavedRequest => !!r)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((req) => (
                <div key={req.id} style={{ paddingLeft: (depth + 1) * 12 }}>
                  <RequestListItem
                    request={req}
                    isActive={activeRequestId === req.id}
                    onClick={() => onLoadRequest(req)}
                    onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
                  />
                </div>
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
      <div className="flex items-center justify-between mb-2">
        {isOpen && <NewFolderIconButton onClick={() => handleAddFolder(null)} />}
        <SidebarToggleButton isOpen={isOpen} onClick={onToggle} />
      </div>
      {isOpen && (
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <div className="flex-grow overflow-y-auto">
            {savedFolders.length === 0 && savedRequests.length === 0 && (
              <p className="text-gray-500">{t('no_saved_requests')}</p>
            )}
            {savedFolders
              .filter((f) => f.parentFolderId === null)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((folder) => renderFolder(folder.id, 0))}
            {rootRequests.map((req) => (
              <RequestListItem
                key={req.id}
                request={req}
                isActive={activeRequestId === req.id}
                onClick={() => onLoadRequest(req)}
                onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
              />
            ))}
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
            { label: t('context_menu_new_folder'), onClick: () => handleAddFolder(folderMenu.id) },
            { label: t('context_menu_new_request'), onClick: onNewRequest },
            {
              label: t('context_menu_rename_folder'),
              onClick: () => handleRenameFolder(folderMenu.id),
            },
            {
              label: t('context_menu_delete_folder'),
              onClick: () => handleDeleteFolder(folderMenu.id),
            },
          ]}
          onClose={closeFolderMenu}
        />
      )}
    </div>
  );
};
