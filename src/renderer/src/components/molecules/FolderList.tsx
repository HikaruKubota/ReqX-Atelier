import React, { useState } from 'react';
import type { RequestFolder, SavedRequest } from '../types';
import { FolderListItem } from '../atoms/list/FolderListItem';
import { RequestListItem } from '../atoms/list/RequestListItem';

interface FolderListProps {
  folders: RequestFolder[];
  requests: SavedRequest[];
  activeRequestId: string | null;
  onSelectRequest: (req: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  requests,
  activeRequestId,
  onSelectRequest,
  onDeleteRequest,
}) => {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {folders.map((f) => (
        <div key={f.id} className="mb-2">
          <FolderListItem
            folder={f}
            isOpen={!!openMap[f.id]}
            onToggle={() => toggle(f.id)}
          />
          {openMap[f.id] && (
            <div className="ml-4">
              {requests
                .filter((r) => r.folderId === f.id)
                .map((req) => (
                  <RequestListItem
                    key={req.id}
                    request={req}
                    isActive={activeRequestId === req.id}
                    onClick={() => onSelectRequest(req)}
                    onDelete={() => onDeleteRequest(req.id)}
                  />
                ))}
            </div>
          )}
        </div>
      ))}
      {/* requests without folder */}
      {requests
        .filter((r) => !r.folderId)
        .map((req) => (
          <RequestListItem
            key={req.id}
            request={req}
            isActive={activeRequestId === req.id}
            onClick={() => onSelectRequest(req)}
            onDelete={() => onDeleteRequest(req.id)}
          />
        ))}
    </div>
  );
};
