import React from 'react';
import type { SavedRequest } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  activeRequestId,
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
      <SidebarToggleButton isOpen={isOpen} onClick={onToggle} className="self-end mb-2" />
      {isOpen && (
        <>
          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>My Collection</h2>
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
        </>
      )}
    </div>
  );
};
