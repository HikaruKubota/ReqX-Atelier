import React from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { RequestCollectionTree } from './RequestCollectionTree';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderIconButton } from './atoms/button/NewFolderIconButton';
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
          <div className="mb-2">
            <NewFolderIconButton onClick={() => onAddFolder(null)} />
          </div>
          <div className="flex-grow overflow-y-auto">
            {savedRequests.length === 0 && savedFolders.length === 0 && (
              <p className="text-gray-500">{t('no_saved_requests')}</p>
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
            />
          </div>
        </>
      )}
    </div>
  );
};
