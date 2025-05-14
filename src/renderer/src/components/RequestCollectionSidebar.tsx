import * as React from 'react';
import type { SavedRequest } from '../hooks/useSavedRequests'; // Adjust path as needed

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onNewRequest: () => void;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  healthStatus: string;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  activeRequestId,
  onNewRequest,
  onLoadRequest,
  onDeleteRequest,
  healthStatus,
}) => {
  return (
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', height: '100vh' }}>
      <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>My Collection</h2>
      <button onClick={onNewRequest} style={{ marginBottom: '10px', padding: '8px' }}>
        + New Request
      </button>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {savedRequests.length === 0 && <p style={{ color: '#777' }}>No requests saved yet.</p>}
        {savedRequests.map((req: SavedRequest) => (
          <div
            key={req.id}
            onClick={() => onLoadRequest(req)}
            style={{
              padding: '8px 10px',
              margin: '5px 0',
              cursor: 'pointer',
              backgroundColor: activeRequestId === req.id ? '#e0e0e0' : '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: activeRequestId === req.id ? 'bold' : 'normal' }}>{req.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteRequest(req.id); }}
              style={{ padding: '3px 6px', fontSize: '0.8em', backgroundColor: '#ffcccc', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >X</button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.8em', color: '#aaa', marginTop: '10px', flexShrink: 0 }}>Health: {healthStatus}</p>
    </div>
  );
};
