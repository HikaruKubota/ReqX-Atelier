import React from 'react';
import type { SavedFolder, SavedRequest } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { Tree, NodeApi, DragPreviewProps, CursorProps } from 'react-arborist';
import { useTreeApi } from 'react-arborist/dist/main/context';
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

  const DragPreviewComponent: React.FC<DragPreviewProps> = ({ offset, id, isDragging }) => {
    const tree = useTreeApi<TreeNode>();
    if (!isDragging) return null;
    const node = id ? tree.get(id) : null;
    if (!node) return null;
    const style: React.CSSProperties = offset
      ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
      : { display: 'none' };
    return (
      <div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 100,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <div className="row preview" style={style}>
          <tree.renderNode
            preview
            node={node}
            style={{
              paddingLeft: node.level * tree.indent,
              opacity: 0.7,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              background: 'transparent',
            }}
            tree={tree}
          />
        </div>
      </div>
    );
  };

  const DragPreview = React.memo(DragPreviewComponent);
  DragPreview.displayName = 'DragPreview';

  const CursorComponent: React.FC<CursorProps> = ({ top, left, indent }) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      top: top - 2 + 'px',
      left: left + 'px',
      right: indent + 'px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1,
    };
    return (
      <div style={style}>
        <div
          style={{
            width: 4,
            height: 4,
            boxShadow: '0 0 0 3px var(--color-primary)',
            borderRadius: '50%',
          }}
        ></div>
        <div className="drop-cursor-line flex-1 rounded-sm"></div>
      </div>
    );
  };

  const Cursor = React.memo(CursorComponent);
  Cursor.displayName = 'Cursor';

  const [folderMenu, setFolderMenu] = React.useState<{ id: string; x: number; y: number } | null>(
    null,
  );
  const [requestMenu, setRequestMenu] = React.useState<{ id: string; x: number; y: number } | null>(
    null,
  );

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
      const dropClass = node.willReceiveDrop ? 'drop-target-outline' : '';
      if (node.data.type === 'folder') {
        return (
          <div style={style} ref={dragHandle} className={`select-none ${dropClass}`}>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => node.toggle()}
              onContextMenu={(e) => {
                e.preventDefault();
                setFolderMenu({ id: node.id, x: e.clientX, y: e.clientY });
              }}
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
          className={`h-full flex items-center ${dropClass}`}
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
        rowHeight={26}
        data={data}
        disableDrop={disableDrop}
        onMove={handleMove}
        renderDragPreview={DragPreview}
        renderCursor={Cursor}
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
