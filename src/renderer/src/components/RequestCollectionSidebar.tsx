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
  onAddFolder: (folder: Omit<SavedFolder, 'id'>) => string;
  onUpdateFolder: (id: string, updated: Partial<Omit<SavedFolder, 'id'>>) => void;
  onDeleteFolder: (id: string) => void;
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
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  onNewRequest,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [folderMenu, setFolderMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const closeMenu = () => setMenu(null);
  const closeFolderMenu = () => setFolderMenu(null);

  const toggleFolder = (id: string) => setOpenFolders((o) => ({ ...o, [id]: !o[id] }));

  const renderRequestItem = (req: SavedRequest) => (
    <RequestListItem
      key={req.id}
      request={req}
      isActive={activeRequestId === req.id}
      onClick={() => onLoadRequest(req)}
      onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
    />
  );

  const renderFolderList = (parentId: string | null): React.ReactNode => {
    const folders = savedFolders
      .filter((f) => f.parentFolderId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
    return folders.map((folder) => (
      <div key={folder.id} className="ml-2">
        <FolderListItem
          folder={folder}
          open={!!openFolders[folder.id]}
          onToggle={() => toggleFolder(folder.id)}
          onContextMenu={(e) => setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY })}
        />
        {openFolders[folder.id] && (
          <div className="ml-4">
            {renderFolderList(folder.id)}
            {folder.requestIds
              .map((rid) => savedRequests.find((r) => r.id === rid))
              .filter(Boolean)
              .sort((a, b) => (a as SavedRequest).name.localeCompare((b as SavedRequest).name))
              .map((r) => renderRequestItem(r as SavedRequest))}
          </div>
        )}
      </div>
    ));
  };

  const rootRequests = savedRequests
    .filter((r) => savedFolders.every((f) => !f.requestIds.includes(r.id)))
    .sort((a, b) => a.name.localeCompare(b.name));
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
            <NewFolderButton
              onClick={() => {
                const name = prompt(t('new_folder'));
                if (name) {
                  onAddFolder({ name, parentFolderId: null, requestIds: [], subFolderIds: [] });
                }
              }}
            />
          </div>
          <div className="flex-grow overflow-y-auto">
            {savedRequests.length === 0 && savedFolders.length === 0 && (
              <p className="text-gray-500">{t('no_saved_requests')}</p>
            )}
            {renderFolderList(null)}
            {rootRequests.map((req) => renderRequestItem(req))}
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
              label: t('context_menu_new_folder'),
              onClick: () => {
                const name = prompt(t('new_folder'));
                if (name) {
                  const newId = onAddFolder({
                    name,
                    parentFolderId: folderMenu.id,
                    requestIds: [],
                    subFolderIds: [],
                  });
                  toggleFolder(folderMenu.id);
                  setOpenFolders((o) => ({ ...o, [newId]: true }));
                }
              },
            },
            {
              label: t('context_menu_new_request'),
              onClick: () => onNewRequest(),
            },
            {
              label: t('context_menu_rename_folder'),
              onClick: () => {
                const name = prompt(t('context_menu_rename_folder'));
                if (name) onUpdateFolder(folderMenu.id, { name });
              },
            },
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
};
