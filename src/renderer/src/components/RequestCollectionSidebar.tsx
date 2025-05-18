import React from 'react';
import type { SavedRequest, RequestFolder } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { NewRequestButton } from './atoms/button/NewRequestButton';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { NewFolderButton } from './atoms/button/NewFolderButton';
import { FolderList } from './molecules/FolderList';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  folders: RequestFolder[];
  activeRequestId: string | null;
  onNewRequest: () => void;
  onNewFolder: () => void;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  folders,
  activeRequestId,
  onNewRequest,
  onNewFolder,
  onLoadRequest,
  onDeleteRequest,
  isOpen,
  onToggle,
}) => {
  return (
    <div
      data-testid="sidebar"
      style={{
        width: isOpen ? '250px' : '40px',
        flexShrink: 0,
        borderRight: '1px solid #ccc',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        height: '100vh',
      }}
    >
      <SidebarToggleButton
        isOpen={isOpen}
        onClick={onToggle}
        className="self-end mb-2"
      />
      {isOpen && (
        <>
          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>My Collection</h2>
          <div className="flex gap-2">
            <NewRequestButton onClick={onNewRequest} />
            <NewFolderButton onClick={onNewFolder} />
          </div>
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {savedRequests.length === 0 && folders.length === 0 && (
              <p style={{ color: '#777' }}>No requests saved yet.</p>
            )}
            <FolderList
              folders={folders}
              requests={savedRequests}
              activeRequestId={activeRequestId}
              onSelectRequest={onLoadRequest}
              onDeleteRequest={onDeleteRequest}
            />
          </div>
        </>
      )}
    </div>
  );
};
