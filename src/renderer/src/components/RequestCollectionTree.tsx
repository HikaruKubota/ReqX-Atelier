import React from 'react';
import clsx from 'clsx';
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
  onFocusNode?: (info: { id: string; type: 'folder' | 'request' }) => void;
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
  onFocusNode,
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

  const requestParentMap = React.useMemo(() => {
    const map = new Map<string, string | null>();
    folders.forEach((f) => {
      f.requestIds.forEach((rid) => map.set(rid, f.id));
    });
    return map;
  }, [folders]);

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

  const [menu, setMenu] = React.useState<{
    id: string;
    type: 'folder' | 'request';
    x: number;
    y: number;
  } | null>(null);

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
              className={clsx(
                'select-none h-full w-full px-3 flex items-center gap-1',
                node.isSelected && 'bg-selection/50',
              )}
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
              className={clsx(
                'flex items-center gap-1 cursor-pointer w-full',
                node.isSelected && 'bg-selection/50',
              )}
              onContextMenu={(e) => {
                e.preventDefault();
                node.select();
                onFocusNode?.({ id: node.id, type: 'folder' });
                setMenu({ id: node.id, type: 'folder', x: e.clientX, y: e.clientY });
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
            className={clsx(
              'select-none h-full w-full px-3 flex items-center gap-1',
              node.isSelected && 'bg-primary/10',
            )}
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
          className={clsx('h-full flex items-center', node.isSelected && 'bg-primary/10')}
          onContextMenu={(e) => {
            e.preventDefault();
            node.select();
            onFocusNode?.({ id: node.id, type: 'request' });
            setMenu({ id: node.id, type: 'request', x: e.clientX, y: e.clientY });
          }}
        >
          <RequestListItem
            request={req}
            isActive={activeRequestId === req.id}
            isSelected={node.isSelected}
          />
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
          if (
            (e.metaKey || e.ctrlKey) &&
            e.altKey &&
            (e.key === 'ArrowRight' || e.key === 'ArrowLeft')
          ) {
            // Prevent folder toggle when using Cmd/Ctrl+Alt+Arrow for tab switch
            e.stopPropagation();
            return;
          }
          if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
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
          disableDrop={disableDrop}
          onMove={handleMove}
          onFocus={(node) => onFocusNode?.({ id: node.id, type: node.data.type })}
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
      {menu && (
        <ContextMenu
          position={{ x: menu.x, y: menu.y }}
          title={t('context_menu_title', { name: idMap.get(menu.id)?.name })}
          items={[
            {
              label: t('context_menu_copy'),
              onClick: () =>
                menu.type === 'folder' ? onCopyFolder(menu.id) : onCopyRequest(menu.id),
            },
            {
              label: t('context_menu_delete'),
              onClick: () =>
                menu.type === 'folder' ? onDeleteFolder(menu.id) : onDeleteRequest(menu.id),
            },
            {
              label: t('context_menu_rename'),
              onClick: () => {
                treeRef.current?.get?.(menu.id)?.edit();
                setMenu(null);
              },
            },
            {
              label: t('context_menu_new_request'),
              onClick: () =>
                onAddRequest(
                  menu.type === 'folder' ? menu.id : (requestParentMap.get(menu.id) ?? null),
                ),
            },
            {
              label: t('context_menu_new_folder'),
              onClick: () =>
                onAddFolder(
                  menu.type === 'folder' ? menu.id : (requestParentMap.get(menu.id) ?? null),
                ),
            },
          ]}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
};
