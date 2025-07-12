import { useEffect } from 'react';
import { useFolderTreeStore } from '../store/folderTreeStore';
import { useSavedRequestsStore } from '../store/savedRequestsStore';

/**
 * Hook that syncs operations from folderTreeStore back to savedRequestsStore
 */
export function useFolderTreeSync() {
  const { treeState } = useFolderTreeStore();
  const { updateRequest, updateFolder, deleteRequest, deleteFolder, moveRequest, moveFolder } =
    useSavedRequestsStore();

  // Watch for name changes
  useEffect(() => {
    const handleEndEditing = (nodeId: string, newName: string) => {
      const node = treeState.nodes.get(nodeId);
      if (!node) return;

      // Find the corresponding saved item
      const nodeMap = (
        window as unknown as {
          __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
        }
      ).__folderTreeNodeMap;

      const mapping = nodeMap?.get(nodeId);
      if (!mapping) return;

      if (mapping.type === 'folder') {
        updateFolder(mapping.id, { name: newName });
      } else {
        updateRequest(mapping.id, { name: newName });
      }
    };

    // Store the handler for access from the tree
    (
      window as unknown as { __folderTreeHandleEndEditing?: typeof handleEndEditing }
    ).__folderTreeHandleEndEditing = handleEndEditing;
  }, [treeState.nodes, updateRequest, updateFolder]);

  // Watch for deletions
  useEffect(() => {
    const handleDelete = (nodeIds: string[]) => {
      const nodeMap = (
        window as unknown as {
          __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
        }
      ).__folderTreeNodeMap;

      nodeIds.forEach((nodeId) => {
        const mapping = nodeMap?.get(nodeId);
        if (!mapping) return;

        if (mapping.type === 'folder') {
          deleteFolder(mapping.id);
        } else {
          deleteRequest(mapping.id);
        }
      });
    };

    (
      window as unknown as { __folderTreeHandleDelete?: typeof handleDelete }
    ).__folderTreeHandleDelete = handleDelete;
  }, [deleteRequest, deleteFolder]);

  // Watch for moves
  useEffect(() => {
    const handleMove = (
      nodeId: string,
      targetNodeId: string,
      position: 'before' | 'after' | 'inside',
    ) => {
      const nodeMap = (
        window as unknown as {
          __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
        }
      ).__folderTreeNodeMap;

      const sourceMapping = nodeMap?.get(nodeId);
      const targetMapping = targetNodeId ? nodeMap?.get(targetNodeId) : null;

      if (!sourceMapping) return;

      const targetFolderId =
        position === 'inside' && targetMapping?.type === 'folder' ? targetMapping.id : null;

      if (sourceMapping.type === 'folder') {
        moveFolder(sourceMapping.id, targetFolderId);
      } else {
        moveRequest(sourceMapping.id, targetFolderId);
      }
    };

    (window as unknown as { __folderTreeHandleMove?: typeof handleMove }).__folderTreeHandleMove =
      handleMove;
  }, [moveRequest, moveFolder]);
}
