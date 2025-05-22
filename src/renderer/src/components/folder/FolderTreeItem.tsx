import React, { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi';
import { RequestListItem } from '../atoms/list/RequestListItem';
import { ContextMenu } from '../atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import type { SavedFolder, SavedRequest } from '../../types';

interface FolderTreeItemProps {
  folder: SavedFolder;
  getFolderChildren: (id: string) => { folders: SavedFolder[]; requests: SavedRequest[] };
  activeRequestId: string | null;
  onLoadRequest: (req: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: (parentId: string) => void;
  onAddRequest: (parentId: string) => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  getFolderChildren,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onAddRequest,
  onRenameFolder,
  onDeleteFolder,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [folderMenu, setFolderMenu] = useState<{ x: number; y: number } | null>(null);
  const [requestMenu, setRequestMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const { t } = useTranslation();
  const children = getFolderChildren(folder.id);

  const sortedFolders = [...children.folders].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
  const sortedRequests = [...children.requests].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );

  return (
    <div className="ml-2">
      <div
        role="treeitem"
        tabIndex={0}
        className="flex items-center gap-1 cursor-pointer select-none w-full"
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setExpanded((p) => !p);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setFolderMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        {expanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
        <FiFolder size={14} />
        <span className="truncate">{folder.name}</span>
      </div>
      {expanded && (
        <div className="ml-4">
          {sortedFolders.map((f) => (
            <FolderTreeItem
              key={f.id}
              folder={f}
              getFolderChildren={getFolderChildren}
              activeRequestId={activeRequestId}
              onLoadRequest={onLoadRequest}
              onDeleteRequest={onDeleteRequest}
              onCopyRequest={onCopyRequest}
              onAddFolder={onAddFolder}
              onAddRequest={onAddRequest}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
          {sortedRequests.map((r) => (
            <div key={r.id} className="mt-1">
              <RequestListItem
                request={r}
                isActive={activeRequestId === r.id}
                onClick={() => onLoadRequest(r)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setRequestMenu({ id: r.id, x: e.clientX, y: e.clientY });
                }}
              />
              {requestMenu && requestMenu.id === r.id && (
                <ContextMenu
                  position={{ x: requestMenu.x, y: requestMenu.y }}
                  title={t('context_menu_title', { name: r.name })}
                  items={[
                    { label: t('context_menu_copy_request'), onClick: () => onCopyRequest(r.id) },
                    {
                      label: t('context_menu_delete_request'),
                      onClick: () => onDeleteRequest(r.id),
                    },
                  ]}
                  onClose={() => setRequestMenu(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {folderMenu && (
        <ContextMenu
          position={{ x: folderMenu.x, y: folderMenu.y }}
          onClose={() => setFolderMenu(null)}
          items={[
            { label: t('context_menu_new_folder'), onClick: () => onAddFolder(folder.id) },
            { label: t('context_menu_new_request'), onClick: () => onAddRequest(folder.id) },
            { label: t('context_menu_rename_folder'), onClick: () => onRenameFolder(folder.id) },
            { label: t('context_menu_delete_folder'), onClick: () => onDeleteFolder(folder.id) },
          ]}
        />
      )}
    </div>
  );
};
