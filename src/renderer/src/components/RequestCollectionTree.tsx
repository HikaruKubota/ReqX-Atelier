import React from 'react';
import type { SavedFolder, SavedRequest } from '../types';
import { RequestListItem } from './atoms/list/RequestListItem';
import { ContextMenu } from './atoms/menu/ContextMenu';
import { useTranslation } from 'react-i18next';
import { Tree, NodeApi, type TreeApi } from 'react-arborist';
import { FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi';
import { useSavedRequests } from '../hooks/useSavedRequests';
import { useElementSize } from '../hooks/useElementSize';
import MethodIcon from './atoms/MethodIcon';

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
  onDeleteFolder: (id: string) => void;
  onCopyFolder: (id: string) => void;
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
  onDeleteFolder,
  onCopyFolder,
  moveRequest,
  moveFolder,
}) => {
  const { t } = useTranslation();
  const { updateRequest, updateFolder } = useSavedRequests();
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
      // React‑Arborist 用の内部ルート ID
      const rootId = '__REACT_ARBORIST_INTERNAL_ROOT__';
      const targetId = !parentId || parentId === rootId ? null : parentId;

      dragIds.forEach((id, i) => {
        const item = idMap.get(id);
        if (!item) return;
        const targetIndex = index + i;

        if (item.type === 'request') {
          moveRequest(id, targetId, targetIndex);
        } else {
          moveFolder(id, targetId, targetIndex);
        }
      });
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
  const [selection, setSelection] = React.useState<string[]>([]);

  React.useEffect(() => {
    console.log({selection});
  }, [selection])

  const treeRef = React.useRef<TreeApi<TreeNode> | null>(null);
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();

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
      if (node.data.type === 'folder') {
        if (node.isEditing) {
          return (
            <div
              style={style}
              ref={dragHandle}
              className="select-none h-full w-full px-3 flex items-center gap-1"
            >
              <FiFolder size={16} />
              <input
                autoFocus
                defaultValue={node.data.name}
                className="w-full h-full bg-transparent text-sm leading-tight outline-none"
                onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => {
                  const newName = e.currentTarget.value.trim();
                  if (newName) {
                    node.submit(newName); // Arborist: commit rename
                    updateFolder(node.id, { name: newName }); // Persist to store
                  } else {
                    node.reset(); // Empty => cancel
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                  if (e.key === 'Escape') {
                    node.reset();
                  }
                }}
              />
            </div>
          );
        }

        // Normal (non‑editing) folder row
        return (
          <div style={style} ref={dragHandle} className="select-none">
            <div
              className="flex items-center gap-1 cursor-pointer w-full"
              onContextMenu={(e) => {
                e.preventDefault();
                setFolderMenu({ id: node.id, x: e.clientX, y: e.clientY });
              }}
            >
              {node.isOpen ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
              <FiFolder size={14} />
              <span className="flex-1 truncate">{node.data.name}</span>
            </div>
          </div>
        );
      }

      const req = requestMap.get(node.id)!;

      if (node.isEditing) {
        return (
          <div
            style={style}
            ref={dragHandle}
            className="select-none h-full w-full px-3 flex items-center gap-1"
          >
            <MethodIcon size={16} method={req.method} />
            <input
              autoFocus
              defaultValue={req.name}
              className="w-full h-full bg-transparent text-sm leading-tight outline-none"
              onFocus={(e) => e.currentTarget.select()}
              onBlur={(e) => {
                const newName = e.currentTarget.value.trim();
                if (newName) {
                  node.submit(newName); // commit rename
                  updateRequest(req.id, { name: newName }); // Persist to store
                } else {
                  node.reset(); // cancel
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.currentTarget as HTMLInputElement).blur();
                }
                if (e.key === 'Escape') {
                  node.reset();
                }
              }}
            />
          </div>
        );
      }

      return (
        <div
          style={style}
          ref={dragHandle}
          className="h-full flex items-center"
          onContextMenu={(e) => {
            e.preventDefault();
            setRequestMenu({ id: node.id, x: e.clientX, y: e.clientY });
          }}
        >
          <RequestListItem request={req} isActive={activeRequestId === req.id} />
        </div>
      );
    },
    [activeRequestId, onLoadRequest, requestMap, updateRequest],
  );

  return (
    <>
      <div
        tabIndex={0}
        ref={containerRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const node = treeRef.current?.focusedNode;
            if (node && !node.isEditing) {
              node.edit(); // start rename for folder or request
              e.preventDefault();
            }
          }
        }}
        className="outline-none h-full"
      >
        <Tree<TreeNode>
          ref={treeRef}
          openByDefault
          width={size.width}
          height={size.height}
          rowHeight={26}
          data={data}
          onSelect={(nodes) => setSelection(nodes.map((n) => n.id))}
          disableDrop={disableDrop}
          onMove={handleMove}
          onActivate={(node) => {
            if (node.data.type === 'folder') {
              node.toggle();
            } else {
              onLoadRequest(requestMap.get(node.id)!);
            }
          }}
          className="no-scrollbar"
        >
          {renderNode}
        </Tree>
      </div>
      {folderMenu && (
        <ContextMenu
          position={{ x: folderMenu.x, y: folderMenu.y }}
          items={[
            { label: t('context_menu_new_folder'), onClick: () => onAddFolder(folderMenu.id) },
            { label: t('context_menu_new_request'), onClick: () => onAddRequest(folderMenu.id) },
            {
              label: t('context_menu_rename_folder'),
              onClick: () => {
                treeRef.current?.get?.(folderMenu.id)?.edit(); // start inline rename
                setFolderMenu(null); // close the context menu
              },
            },
            { label: t('context_menu_copy_folder'), onClick: () => onCopyFolder(folderMenu.id) },
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
