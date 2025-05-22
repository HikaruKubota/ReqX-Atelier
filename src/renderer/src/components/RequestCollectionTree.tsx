import React from 'react';
import type { SavedFolder, SavedRequest } from '../types';
import { FolderTreeItem } from './folder/FolderTreeItem';
import { RequestListItem } from './atoms/list/RequestListItem';
import { useTranslation } from 'react-i18next';
import { ContextMenu } from './atoms/menu/ContextMenu';

interface Props {
  folders: SavedFolder[];
  requests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (req: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: (parentId: string | null) => void;
  onAddRequest: (parentId: string | null) => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const RequestCollectionTree: React.FC<Props> = ({
  folders,
  requests,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onAddRequest,
  onRenameFolder,
  onDeleteFolder,
}) => {
  const { t } = useTranslation();
  const [requestMenu, setRequestMenu] = React.useState<{ id: string; x: number; y: number } | null>(
    null,
  );

  const getFolderChildren = React.useCallback(
    (id: string) => {
      const folder = folders.find((f) => f.id === id);
      if (!folder) return { folders: [], requests: [] };
      const childFolders = folders.filter((f) => f.parentFolderId === id);
      const childRequests = requests.filter((r) => folder.requestIds.includes(r.id));
      return { folders: childFolders, requests: childRequests };
    },
    [folders, requests],
  );

  const rootFolders = folders.filter((f) => f.parentFolderId === null);
  const folderRequestIds = new Set(folders.flatMap((f) => f.requestIds));
  const rootRequests = requests.filter((r) => !folderRequestIds.has(r.id));

  const sortedRootFolders = [...rootFolders].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
  const sortedRootRequests = [...rootRequests].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );

  return (
    <div>
      {sortedRootFolders.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
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
      {sortedRootRequests.map((req) => (
        <div
          key={req.id}
          className="mt-1"
          onContextMenu={(e) => {
            e.preventDefault();
            setRequestMenu({ id: req.id, x: e.clientX, y: e.clientY });
          }}
        >
          <RequestListItem
            request={req}
            isActive={activeRequestId === req.id}
            onClick={() => onLoadRequest(req)}
          />
          {requestMenu && requestMenu.id === req.id && (
            <ContextMenu
              position={{ x: requestMenu.x, y: requestMenu.y }}
              title={t('context_menu_title', { name: req.name })}
              items={[
                { label: t('context_menu_copy_request'), onClick: () => onCopyRequest(req.id) },
                { label: t('context_menu_delete_request'), onClick: () => onDeleteRequest(req.id) },
              ]}
              onClose={() => setRequestMenu(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
