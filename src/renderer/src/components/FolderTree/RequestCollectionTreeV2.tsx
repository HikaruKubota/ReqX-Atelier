import React from 'react';
import { FolderTreeAdapter } from './FolderTreeAdapter';
import { useFolderTreeStore } from '../../store/folderTreeStore';
import type { SavedRequest } from '../../types';

interface RequestCollectionTreeV2Props {
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
  className?: string;
  useVirtualization?: boolean;
}

/**
 * Drop-in replacement for RequestCollectionTree using the new folder tree implementation
 */
export const RequestCollectionTreeV2: React.FC<RequestCollectionTreeV2Props> = ({
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onAddRequest,
  onDeleteFolder,
  onCopyFolder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moveRequest: _moveRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moveFolder: _moveFolder,
  onFocusNode,
  className,
  useVirtualization = false,
}) => {
  // Handle context menu actions
  React.useEffect(() => {
    const handleContextAction = (action: string, nodeId: string) => {
      const nodeMap = (
        window as unknown as {
          __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
        }
      ).__folderTreeNodeMap;

      const mapping = nodeMap?.get(nodeId);
      if (!mapping) return;

      switch (action) {
        case 'delete':
          if (mapping.type === 'folder') {
            onDeleteFolder(mapping.id);
          } else {
            onDeleteRequest(mapping.id);
          }
          break;
        case 'copy':
          if (mapping.type === 'folder') {
            onCopyFolder(mapping.id);
          } else {
            onCopyRequest(mapping.id);
          }
          break;
        case 'newFolder':
          if (mapping.type === 'folder') {
            onAddFolder(mapping.id);
          }
          break;
        case 'newRequest':
          if (mapping.type === 'folder') {
            onAddRequest(mapping.id);
          }
          break;
      }
    };

    (
      window as unknown as { __folderTreeContextAction?: typeof handleContextAction }
    ).__folderTreeContextAction = handleContextAction;
  }, [onDeleteRequest, onDeleteFolder, onCopyRequest, onCopyFolder, onAddFolder, onAddRequest]);

  // Handle focusing on active request
  React.useEffect(() => {
    if (!activeRequestId) return;

    const nodeMap = (
      window as unknown as {
        __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
      }
    ).__folderTreeNodeMap;

    if (!nodeMap) return;

    // Find the node ID for the active request
    const entry = Array.from(nodeMap.entries()).find(
      ([, mapping]) => mapping.type === 'request' && mapping.id === activeRequestId,
    );

    if (entry) {
      const [nodeId] = entry;
      useFolderTreeStore.getState().selectNode(nodeId);
      useFolderTreeStore.getState().focusNode(nodeId);
    }
  }, [activeRequestId]);

  // Handle node focus callback
  React.useEffect(() => {
    if (!onFocusNode) return;

    const subscription = useFolderTreeStore.subscribe((state, prevState) => {
      if (
        state.treeState.focusedId !== prevState.treeState.focusedId &&
        state.treeState.focusedId
      ) {
        const nodeMap = (
          window as unknown as {
            __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
          }
        ).__folderTreeNodeMap;

        const mapping = nodeMap?.get(state.treeState.focusedId);
        if (mapping) {
          onFocusNode({ id: mapping.id, type: mapping.type });
        }
      }
    });

    return () => subscription();
  }, [onFocusNode]);

  return (
    <FolderTreeAdapter
      onOpenRequest={onLoadRequest}
      className={className}
      useVirtualization={useVirtualization}
    />
  );
};
