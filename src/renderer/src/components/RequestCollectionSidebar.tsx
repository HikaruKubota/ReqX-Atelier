import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { FolderListItem } from './atoms/list/FolderListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: (name: string, parent: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onMoveRequest: (id: string, folderId: string | null) => void;
  onMoveFolder: (id: string, folderId: string | null) => void;
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
  onDeleteFolder,
  onRenameFolder,
  onMoveRequest,
  onMoveFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [reqMenu, setReqMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [folderMenu, setFolderMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [rootMenu, setRootMenu] = useState<{ x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { setNodeRef: setRootRef } = useDroppable({ id: 'folder:root' });

  const closeMenus = () => {
    setReqMenu(null);
    setFolderMenu(null);
    setRootMenu(null);
  };

  const renderRequests = (ids: string[]) => {
    const list = savedRequests.filter((r) => ids.includes(r.id));
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list.map((req) => (
      <RequestListItem
        key={req.id}
        request={req}
        isActive={activeRequestId === req.id}
        onClick={() => onLoadRequest(req)}
        onContextMenu={(e) => setReqMenu({ id: req.id, x: e.clientX, y: e.clientY })}
      />
    ));
  };

  const renderFolder = (folder: SavedFolder, level: number) => {
    const childFolders = savedFolders
      .filter((f) => f.parentFolderId === folder.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <FolderListItem
        key={folder.id}
        id={folder.id}
        name={folder.name}
        level={level}
        collapsed={collapsed[folder.id] ?? false}
        onToggle={() => setCollapsed((p) => ({ ...p, [folder.id]: !(p[folder.id] ?? false) }))}
        onContextMenu={(e) => setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY })}
      >
        {childFolders.map((f) => renderFolder(f, level + 1))}
        {renderRequests(folder.requestIds)}
      </FolderListItem>
    );
  };

  const rootFolders = savedFolders
    .filter((f) => !f.parentFolderId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const requestsInRoot = savedRequests.filter(
    (r) => !savedFolders.some((f) => f.requestIds.includes(r.id)),
  );
  requestsInRoot.sort((a, b) => a.name.localeCompare(b.name));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const [type, id] = String(active.id).split(':');
    const [, folderId] = String(over.id).split(':');
    if (type === 'request') {
      onMoveRequest(id, folderId === 'root' ? null : folderId);
    } else if (type === 'folder') {
      onMoveFolder(id, folderId === 'root' ? null : folderId);
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
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div
              ref={setRootRef}
              className="flex-grow overflow-y-auto"
              id="root"
              data-id="root"
              onContextMenu={(e) => {
                e.preventDefault();
                setRootMenu({ x: e.clientX, y: e.clientY });
              }}
            >
              {rootFolders.map((f) => renderFolder(f, 0))}
              {requestsInRoot.map((r) => (
                <RequestListItem
                  key={r.id}
                  request={r}
                  isActive={activeRequestId === r.id}
                  onClick={() => onLoadRequest(r)}
                  onContextMenu={(e) => setReqMenu({ id: r.id, x: e.clientX, y: e.clientY })}
                />
              ))}
              {rootFolders.length === 0 && requestsInRoot.length === 0 && (
                <p className="text-gray-500">{t('no_saved_requests')}</p>
              )}
            </div>
          </DndContext>
        </>
      )}
      {reqMenu && (
        <ContextMenu
          position={{ x: reqMenu.x, y: reqMenu.y }}
          title={t('context_menu_title', {
            name: savedRequests.find((r) => r.id === reqMenu.id)?.name,
          })}
          items={[
            {
              label: t('context_menu_copy_request'),
              onClick: () => onCopyRequest(reqMenu.id),
            },
            {
              label: t('context_menu_delete_request'),
              onClick: () => onDeleteRequest(reqMenu.id),
            },
          ]}
          onClose={closeMenus}
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
                const name = prompt(
                  'Name',
                  savedFolders.find((f) => f.id === folderMenu.id)?.name || '',
                );
                if (name) onRenameFolder(folderMenu.id, name);
              },
            },
            {
              label: t('context_menu_delete_folder'),
              onClick: () => onDeleteFolder(folderMenu.id),
            },
          ]}
          onClose={closeMenus}
        />
      )}
      {rootMenu && (
        <ContextMenu
          position={{ x: rootMenu.x, y: rootMenu.y }}
          items={[
            {
              label: t('new_folder'),
              onClick: () => {
                const name = prompt('Name');
                if (name) onAddFolder(name, null);
              },
            },
          ]}
          onClose={closeMenus}
        />
      )}
    </div>
  );
};

export default RequestCollectionSidebar;
