import React, { useState } from 'react';
import type { SavedRequest } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const closeMenu = () => setMenu(null);
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
          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>
            {t('collection_title')}
          </h2>
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {savedRequests.length === 0 && <p style={{ color: '#777' }}>No requests saved yet.</p>}
            {savedRequests.map((req) => (
              <RequestListItem
                key={req.id}
                request={req}
                isActive={activeRequestId === req.id}
                onClick={() => onLoadRequest(req)}
                onContextMenu={(e) => setMenu({ id: req.id, x: e.clientX, y: e.clientY })}
              />
            ))}
          </div>
        </>
      )}
      {menu && (
        <ContextMenu
          position={{ x: menu.x, y: menu.y }}
          title={t('context_menu_title', {
            name: savedRequests.find((r) => r.id === menu.id)?.name,
          })}
          items={[
            {
              label: t('context_menu_copy_request'),
              onClick: () => onCopyRequest(menu.id),
            },
            {
              label: t('context_menu_delete_request'),
              onClick: () => onDeleteRequest(menu.id),
            },
          ]}
          onClose={closeMenu}
        />
      )}
    </div>
  );
};
