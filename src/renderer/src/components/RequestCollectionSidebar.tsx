import React, { useState, useCallback } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

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
  onMoveRequest: (requestId: string, folderId: string | null) => void;
  onMoveFolder: (folderId: string, targetFolderId: string | null) => void;
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
  onMoveRequest,
  onMoveFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [folderMenu, setFolderMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [rootMenu, setRootMenu] = useState<{ x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const closeMenu = () => {
    setMenu(null);
    setFolderMenu(null);
    setRootMenu(null);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { setNodeRef: setRootDropRef } = useDroppable({ id: 'root' });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        if (active.data.current?.type === 'request') onMoveRequest(String(active.id), null);
        else if (active.data.current?.type === 'folder') onMoveFolder(String(active.id), null);
        return;
      }
      if (over.id === 'root') {
        if (active.data.current?.type === 'request') onMoveRequest(String(active.id), null);
        else if (active.data.current?.type === 'folder') onMoveFolder(String(active.id), null);
      } else if (over.data.current?.type === 'folder') {
        if (active.data.current?.type === 'request')
          onMoveRequest(String(active.id), String(over.id));
        else if (active.data.current?.type === 'folder')
          onMoveFolder(String(active.id), String(over.id));
      }
    },
    [onMoveRequest, onMoveFolder],
  );

  const FolderItem: React.FC<{ folder: SavedFolder; depth: number }> = ({ folder, depth }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: folder.id,
      data: { type: 'folder' },
    });
    const { setNodeRef: setDropRef } = useDroppable({ id: folder.id, data: { type: 'folder' } });
    const isCollapsed = collapsed[folder.id];
    const toggle = () => setCollapsed((c) => ({ ...c, [folder.id]: !c[folder.id] }));

    const requests = savedRequests
      .filter((r) => folder.requestIds.includes(r.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    const subFolders = savedFolders
      .filter((f) => f.parentFolderId === folder.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div ref={setDropRef} className="mt-1" style={{ marginLeft: depth * 10 }}>
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          onClick={toggle}
          onContextMenu={(e) => {
            e.preventDefault();
            setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY });
          }}
          className="px-2 py-1 cursor-pointer font-bold flex items-center gap-1"
        >
          <span>{isCollapsed ? '▶' : '▼'}</span>
          <span>{folder.name}</span>
        </div>
        {!isCollapsed && (
          <div className="ml-4">
            {subFolders.map((sf) => (
              <FolderItem key={sf.id} folder={sf} depth={depth + 1} />
            ))}
            {requests.map((req) => (
              <RequestItem key={req.id} request={req} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const RequestItem: React.FC<{ request: SavedRequest; depth: number }> = ({ request, depth }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: request.id,
      data: { type: 'request' },
    });
    return (
      <div ref={setNodeRef} {...attributes} {...listeners} style={{ marginLeft: depth * 10 }}>
        <RequestListItem
          request={request}
          isActive={activeRequestId === request.id}
          onClick={() => onLoadRequest(request)}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenu({ id: request.id, x: e.clientX, y: e.clientY });
          }}
        />
      </div>
    );
  };

  const renderRootItems = () => {
    const folderList = savedFolders
      .filter((f) => f.parentFolderId === null)
      .sort((a, b) => a.name.localeCompare(b.name));
    const reqIdsInFolders = new Set(savedFolders.flatMap((f) => f.requestIds));
    const rootReqs = savedRequests
      .filter((r) => !reqIdsInFolders.has(r.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <div
        className="flex-grow overflow-y-auto"
        onContextMenu={(e) => {
          e.preventDefault();
          setRootMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        {folderList.map((f) => (
          <FolderItem key={f.id} folder={f} depth={0} />
        ))}
        {rootReqs.map((req) => (
          <RequestItem key={req.id} request={req} depth={0} />
        ))}
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
      <SidebarToggleButton isOpen={isOpen} onClick={onToggle} className="self-end mb-2" />
      {isOpen && (
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div ref={setRootDropRef} id="root">
              {renderRootItems()}
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
            { label: t('context_menu_copy_request'), onClick: () => onCopyRequest(menu.id) },
            { label: t('context_menu_delete_request'), onClick: () => onDeleteRequest(menu.id) },
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
                const name = prompt(t('folder_name_placeholder'));
                if (name) onUpdateFolder(folderMenu.id, { name });
              },
            },
            {
              label: t('context_menu_delete_folder'),
              onClick: () => onDeleteFolder(folderMenu.id),
            },
          ]}
          onClose={closeMenu}
        />
      )}
      {rootMenu && (
        <ContextMenu
          position={{ x: rootMenu.x, y: rootMenu.y }}
          items={[
            {
              label: t('new_folder'),
              onClick: () => {
                const name = prompt(t('folder_name_placeholder')) || t('new_folder');
                onAddFolder({ name, parentFolderId: null, requestIds: [], subFolderIds: [] });
              },
            },
          ]}
          onClose={closeMenu}
        />
      )}
    </div>
  );
};
