import React from 'react';
import { useTranslation } from 'react-i18next';
import type { RequestFolder, SavedRequest } from '../../types';
import { RequestListItem } from '../atoms/list/RequestListItem';

interface RequestFolderSectionProps {
  folder: RequestFolder;
  requests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (req: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
}

export const RequestFolderSection: React.FC<RequestFolderSectionProps> = ({
  folder,
  requests,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
}) => {
  const { t } = useTranslation();
  return (
    <div style={{ marginBottom: '10px' }}>
      <h3>{folder.name}</h3>
      {requests.length === 0 && <p style={{ color: '#777' }}>{t('no_requests')}</p>}
      {requests.map((req) => (
        <RequestListItem
          key={req.id}
          request={req}
          isActive={activeRequestId === req.id}
          onClick={() => onLoadRequest(req)}
          onDelete={() => onDeleteRequest(req.id)}
        />
      ))}
    </div>
  );
};
