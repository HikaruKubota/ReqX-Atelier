import React from 'react';
import type { SavedRequest } from '../hooks/useSavedRequests'; // Adjust path as needed
import { RequestListItem } from './atoms/list/RequestListItem'

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onNewRequest: () => void;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  activeRequestId,
  onNewRequest,
  onLoadRequest,
  onDeleteRequest,
}) => {
  return (
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', height: '100vh' }}>
      <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>My Collection</h2>
      <button onClick={onNewRequest} style={{ marginBottom: '10px', padding: '8px' }}>
        + New Request
      </button>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {savedRequests.length === 0 && <p style={{ color: '#777' }}>No requests saved yet.</p>}
        {savedRequests.map((req) => (
          <RequestListItem
            key={req.id}
            request={req}
            isActive={activeRequestId === req.id}
            onClick={() => onLoadRequest(req)}
            onDelete={() => onDeleteRequest(req.id)}
          />
        ))}
      </div>
    </div>
  );
};
