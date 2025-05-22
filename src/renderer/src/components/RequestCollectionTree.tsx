import React from 'react';
import type { SavedFolder, SavedRequest } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { Tree, NodeApi } from 'react-arborist';
import { FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'request';
  children?: TreeNode[];
}

interface Props {
  folders: SavedFolder[];
  requests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (req: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: (parentId: string | null) => void;
  onAddRequest: (parentId: string | null) => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  moveRequest: (id: string, folderId: string | null, index?: number) => void;
  moveFolder: (id: string, folderId: string | null, index?: number) => void;
}

export const RequestCollectionTree: React.FC<Props> = ({
  folders,
  requests,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onAddRequest,
  onRenameFolder,
  onDeleteFolder,
  moveRequest,
  moveFolder,
}) => {
  const { t } = useTranslation();
  const requestMap = React.useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests]);

  const buildTree = React.useCallback(
    (parentId: string | null): TreeNode[] => {
      const childFolders = folders
        .filter((f) => f.parentFolderId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      const nodes: TreeNode[] = childFolders.map((f) => ({
        id: f.id,
        name: f.name,
        type: 'folder',
        children: buildTree(f.id),
      }));

      const folderRequestIds = new Set(folders.flatMap((f) => f.requestIds));
      const childRequests = parentId
        ? requests.filter((r) => folders.find((f) => f.id === parentId)?.requestIds.includes(r.id))
        : requests.filter((r) => !folderRequestIds.has(r.id));
      const sortedReqs = [...childRequests].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
      nodes.push(
        ...sortedReqs.map(
          (r) => ({ id: r.id, name: r.name, type: 'request' as const }) as TreeNode,
        ),
      );
      return nodes;
    },
    [folders, requests],
  );

  const data = React.useMemo(() => buildTree(null), [buildTree]);

  const idMap = React.useMemo(() => {
    const map = new Map<string, TreeNode>();
    const walk = (list: TreeNode[]) => {
      list.forEach((n) => {
        map.set(n.id, n);
        if (n.children) walk(n.children);
      });
    };
    walk(data);
    return map;
  }, [data]);

  const handleMove = React.useCallback(
    ({
      dragIds,
      parentId,
      index,
    }: {
      dragIds: string[];
      parentId: string | null;
      index: number;
    }) => {
      const id = dragIds[0];
      const item = idMap.get(id);
      if (!item) return;
      if (item.type === 'request') {
        moveRequest(id, parentId, index);
      } else {
        moveFolder(id, parentId, index);
      }
    },
    [idMap, moveRequest, moveFolder],
  );

  const disableDrop = React.useCallback(
    ({
      parentNode,
      dragNodes,
    }: {
      parentNode: NodeApi<TreeNode> | null;
      dragNodes: NodeApi<TreeNode>[];
      index: number;
    }) => {
      if (parentNode && parentNode.data.type === 'request') return true;
      const drag = dragNodes[0];
      if (drag.data.type === 'folder' && parentNode && drag.isAncestorOf(parentNode)) {
        return true;
      }
      return false;
    },
    [],
  );

  const [folderMenu, setFolderMenu] = React.useState<{ id: string; x: number; y: number } | null>(
    null,
  );
  const [requestMenu, setRequestMenu] = React.useState<{ id: string; x: number; y: number } | null>(
    null,
  );

  const hoverTimer = React.useRef<NodeJS.Timeout | null>(null);

  const renderNode = React.useCallback(
    ({
      node,
      style,
      dragHandle,
    }: {
      node: NodeApi<TreeNode>;
      style: React.CSSProperties;
      dragHandle?: (el: HTMLDivElement | null) => void;
    }) => {
      const handleDragOver = () => {
        if (!node.isOpen) {
          if (hoverTimer.current) clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(() => node.open(), 500);
        }
      };
      const clearTimer = () => {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = null;
        }
      };
      if (node.data.type === 'folder') {
        return (
          <div style={style} ref={dragHandle} className="select-none">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => node.toggle()}
              onContextMenu={(e) => {
                e.preventDefault();
                setFolderMenu({ id: node.id, x: e.clientX, y: e.clientY });
              }}
              onDragOver={handleDragOver}
              onDragLeave={clearTimer}
              onDrop={clearTimer}
            >
              {node.isOpen ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
              <FiFolder size={14} />
              <span>{node.data.name}</span>
            </div>
          </div>
        );
      }

      const req = requestMap.get(node.id)!;
      return (
        <div
          style={style}
          ref={dragHandle}
          className="ml-4"
          onContextMenu={(e) => {
            e.preventDefault();
            setRequestMenu({ id: node.id, x: e.clientX, y: e.clientY });
          }}
        >
          <RequestListItem
            request={req}
            isActive={activeRequestId === req.id}
            onClick={() => onLoadRequest(req)}
          />
        </div>
      );
    },
    [activeRequestId, onLoadRequest, requestMap],
  );

  return (
    <>
      <Tree<TreeNode>
        openByDefault
        width="100%"
        height={400}
        data={data}
        disableDrop={disableDrop}
        onMove={handleMove}
      >
        {renderNode}
      </Tree>
      {folderMenu && (
        <ContextMenu
          position={{ x: folderMenu.x, y: folderMenu.y }}
          items={[
            { label: t('context_menu_new_folder'), onClick: () => onAddFolder(folderMenu.id) },
            { label: t('context_menu_new_request'), onClick: () => onAddRequest(folderMenu.id) },
            {
              label: t('context_menu_rename_folder'),
              onClick: () => onRenameFolder(folderMenu.id),
            },
            {
              label: t('context_menu_delete_folder'),
              onClick: () => onDeleteFolder(folderMenu.id),
            },
          ]}
          onClose={() => setFolderMenu(null)}
        />
      )}
      {requestMenu && (
        <ContextMenu
          position={{ x: requestMenu.x, y: requestMenu.y }}
          title={t('context_menu_title', { name: requestMap.get(requestMenu.id)?.name })}
          items={[
            { label: t('context_menu_copy_request'), onClick: () => onCopyRequest(requestMenu.id) },
            {
              label: t('context_menu_delete_request'),
              onClick: () => onDeleteRequest(requestMenu.id),
            },
          ]}
          onClose={() => setRequestMenu(null)}
        />
      )}
    </>
  );
};
