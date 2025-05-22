import React, { useState } from 'react';
import type { SavedRequest, SavedFolder } from '../types';
import { SidebarToggleButton } from './atoms/button/SidebarToggleButton';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { Tree, NodeApi } from 'react-arborist';
import { MethodIcon } from './atoms/MethodIcon';
import { NewFolderIconButton } from './atoms/button/NewFolderIconButton';

interface RequestCollectionSidebarProps {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: () => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'request';
  method?: string;
  children?: TreeNode[];
}

export const RequestCollectionSidebar: React.FC<RequestCollectionSidebarProps> = ({
  savedRequests,
  savedFolders,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{
    id: string;
    type: 'folder' | 'request';
    x: number;
    y: number;
  } | null>(null);
  const closeMenu = () => setMenu(null);

  const nameCompare = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

  const buildTree = (folderId: string | null): TreeNode[] => {
    const folders = savedFolders
      .filter((f) => f.parentFolderId === folderId)
      .sort(nameCompare)
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: 'folder' as const,
        children: [
          ...buildTree(f.id),
          ...f.requestIds
            .map((rid) => savedRequests.find((r) => r.id === rid))
            .filter((r): r is SavedRequest => !!r)
            .sort(nameCompare)
            .map((r) => ({
              id: r.id,
              name: r.name,
              type: 'request' as const,
              method: r.method,
            })),
        ],
      }));

    const requestIdsInFolders = new Set(savedFolders.flatMap((f) => f.requestIds));
    const rootRequests = folderId
      ? []
      : savedRequests
          .filter((r) => !requestIdsInFolders.has(r.id))
          .sort(nameCompare)
          .map((r) => ({
            id: r.id,
            name: r.name,
            type: 'request' as const,
            method: r.method,
          }));

    return folderId ? folders : [...folders, ...rootRequests];
  };

  const data = buildTree(null);

  const handleContextMenu = (node: NodeApi<TreeNode>, e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ id: node.id, type: node.data.type, x: e.clientX, y: e.clientY });
  };

  const Node = ({
    node,
    style,
    dragHandle,
  }: {
    node: NodeApi<TreeNode>;
    style: React.CSSProperties;
    dragHandle?: React.RefCallback<HTMLDivElement>;
  }) => {
    const item = node.data;
    const isActive = activeRequestId === item.id && item.type === 'request';
    return (
      <div
        ref={dragHandle}
        style={style}
        onContextMenu={(e) => handleContextMenu(node, e)}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${isActive ? 'font-bold' : ''}`}
        onClick={() => {
          if (item.type === 'request') {
            const req = savedRequests.find((r) => r.id === item.id);
            if (req) onLoadRequest(req);
          } else {
            node.toggle();
          }
        }}
      >
        {item.type === 'folder' ? (
          <span className="mr-1">{node.isOpen ? '▼' : '▶'}</span>
        ) : (
          <MethodIcon method={item.method || 'GET'} />
        )}
        <span>{item.name}</span>
      </div>
    );
  };

  return (
    <div
      data-testid="sidebar"
      className={`${
        isOpen ? 'w-[250px]' : 'w-[40px]'
      } flex-shrink-0 border-r border-gray-300 p-2 flex flex-col bg-[var(--color-background)] text-[var(--color-text)] h-screen`}
    >
      <div className="flex justify-between items-center mb-2">
        <SidebarToggleButton isOpen={isOpen} onClick={onToggle} />
        {isOpen && <NewFolderIconButton onClick={onAddFolder} />}
      </div>
      {isOpen && (
        <>
          <h2 className="mt-0 mb-[10px] text-[1.2em]">{t('collection_title')}</h2>
          <div className="flex-grow overflow-y-auto" data-testid="tree">
            {data.length === 0 && <p className="text-gray-500">{t('no_saved_requests')}</p>}
            <Tree data={data} openByDefault width="100%" rowHeight={24} onMove={() => {}}>
              {Node}
            </Tree>
          </div>
        </>
      )}
      {menu && (
        <ContextMenu
          position={{ x: menu.x, y: menu.y }}
          title={
            menu.type === 'request'
              ? savedRequests.find((r) => r.id === menu.id)?.name
              : savedFolders.find((f) => f.id === menu.id)?.name
          }
          items={
            menu.type === 'request'
              ? [
                  {
                    label: t('context_menu_copy_request'),
                    onClick: () => onCopyRequest(menu.id),
                  },
                  {
                    label: t('context_menu_delete_request'),
                    onClick: () => onDeleteRequest(menu.id),
                  },
                ]
              : [
                  { label: t('context_menu_new_folder'), onClick: onAddFolder },
                  { label: t('context_menu_new_request'), onClick: () => {} },
                  {
                    label: t('context_menu_rename_folder'),
                    onClick: () => {
                      const name = prompt('Rename', '');
                      if (name) onRenameFolder(menu.id, name);
                    },
                  },
                  {
                    label: t('context_menu_delete_folder'),
                    onClick: () => onDeleteFolder(menu.id),
                  },
                ]
          }
          onClose={closeMenu}
        />
      )}
    </div>
  );
};

export default RequestCollectionSidebar;
