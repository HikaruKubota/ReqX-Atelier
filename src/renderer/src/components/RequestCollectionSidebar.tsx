import React from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestCollectionTree } from './RequestCollectionTree';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderIconButton } from './atoms/button/NewFolderIconButton';
import { NewRequestIconButton } from './atoms/button/NewRequestIconButton';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: (parentId: string | null) => void;
  onAddRequest: (parentId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onCopyFolder: (id: string) => void;
  moveRequest: (id: string, folderId: string | null, index?: number) => void;
  moveFolder: (id: string, folderId: string | null, index?: number) => void;
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
  onAddRequest,
  onDeleteFolder,
  onCopyFolder,
  moveRequest,
  moveFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [focusedNode, setFocusedNode] = React.useState<{
    id: string;
    type: 'folder' | 'request';
  } | null>(null);
  const activeParentFolderId = React.useMemo(() => {
    if (focusedNode) {
      if (focusedNode.type === 'folder') return focusedNode.id;
      const folder = savedFolders.find((f) => f.requestIds.includes(focusedNode.id));
      return folder ? folder.id : null;
    }
    if (!activeRequestId) return null;
    const folder = savedFolders.find((f) => f.requestIds.includes(activeRequestId));
    return folder ? folder.id : null;
  }, [focusedNode, activeRequestId, savedFolders]);

  const [width, setWidth] = React.useState(250);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (event: MouseEvent) => {
      const newWidth = Math.min(Math.max(startWidth + event.clientX - startX, 150), 500);
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      data-testid="sidebar"
      style={{ width: isOpen ? `${width}px` : '40px' }}
      className="flex-shrink-0 border-r border-border p-2 flex flex-col bg-background text-foreground h-screen relative"
    >
      <SidebarToggleButton isOpen={isOpen} onClick={onToggle} className="self-end mb-2" />
      {isOpen && (
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <div className="mb-2 flex gap-2">
            <NewFolderIconButton onClick={() => onAddFolder(activeParentFolderId)} />
            <NewRequestIconButton onClick={() => onAddRequest(activeParentFolderId)} />
          </div>
          <div className="flex-grow overflow-y-auto no-scrollbar">
            {savedRequests.length === 0 && savedFolders.length === 0 && (
              <p className="text-muted-foreground">{t('no_saved_requests')}</p>
            )}
            <RequestCollectionTree
              folders={savedFolders}
              requests={savedRequests}
              activeRequestId={activeRequestId}
              onLoadRequest={onLoadRequest}
              onDeleteRequest={onDeleteRequest}
              onCopyRequest={onCopyRequest}
              onAddFolder={onAddFolder}
              onAddRequest={onAddRequest}
              onDeleteFolder={onDeleteFolder}
              onCopyFolder={onCopyFolder}
              moveRequest={moveRequest}
              moveFolder={moveFolder}
              onFocusNode={setFocusedNode}
            />
          </div>
        </>
      )}
      {isOpen && (
        <div
          role="separator"
          aria-label={t('resize_sidebar')}
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-1 h-full cursor-ew-resize"
        />
      )}
    </div>
  );
};
