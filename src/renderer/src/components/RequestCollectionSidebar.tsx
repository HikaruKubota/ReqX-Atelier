import React from 'react';
import type { SavedRequest, RequestFolder } from '../types';
import { NewRequestButton } from './atoms/button/NewRequestButton';
import { AddFolderButton } from './atoms/button/AddFolderButton';
import { RequestFolderSection } from './organisms/RequestFolderSection';

interface RequestCollectionSidebarProps {
  folders: RequestFolder[];
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onNewRequest: () => void;
  onAddFolder: () => void;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  folders,
  savedRequests,
  activeRequestId,
  onNewRequest,
  onAddFolder,
  onLoadRequest,
  onDeleteRequest,
}) => {
  return (
    <div
      style={{
        width: '250px',
        borderRight: '1px solid #ccc',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        height: '100vh',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>My Collection</h2>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        <NewRequestButton onClick={onNewRequest} />
        <AddFolderButton onClick={onAddFolder} />
      </div>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {folders.map((folder) => (
          <RequestFolderSection
            key={folder.id}
            folder={folder}
            requests={savedRequests.filter((r) => r.folderId === folder.id)}
            activeRequestId={activeRequestId}
            onLoadRequest={onLoadRequest}
            onDeleteRequest={onDeleteRequest}
          />
        ))}
      </div>
    </div>
  );
};
