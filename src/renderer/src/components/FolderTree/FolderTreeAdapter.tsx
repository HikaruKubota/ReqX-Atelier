import React, { useEffect } from 'react';
import { VirtualizedFolderTree } from './VirtualizedFolderTree';
import { FolderTree } from './index';
import { useFolderTreeStore } from '../../store/folderTreeStore';
import { useSavedRequestsStore } from '../../store/savedRequestsStore';
import { useFolderTreeSync } from '../../hooks/useFolderTreeSync';
import type { SavedRequest, SavedFolder } from '../../types';

interface FolderTreeAdapterProps {
  folders?: SavedFolder[];
  requests?: SavedRequest[];
  onOpenRequest?: (request: SavedRequest) => void;
  className?: string;
  useVirtualization?: boolean;
}

/**
 * Adapter component that bridges the new FolderTree with the existing savedRequestsStore
 */
export const FolderTreeAdapter: React.FC<FolderTreeAdapterProps> = ({
  folders: propsFolders,
  requests: propsRequests,
  onOpenRequest,
  className,
  useVirtualization = false,
}) => {
  const { savedRequests: storeRequests, savedFolders: storeFolders } = useSavedRequestsStore();

  // Use props if provided (for testing), otherwise use store
  const savedRequests = propsRequests ?? storeRequests;
  const savedFolders = propsFolders ?? storeFolders;
  const { createNode } = useFolderTreeStore();

  // Enable syncing operations back to savedRequestsStore
  useFolderTreeSync();

  // Sync savedRequestsStore data to folderTreeStore
  useEffect(() => {
    // Clear existing nodes
    useFolderTreeStore.setState({
      treeState: {
        nodes: new Map(),
        rootIds: [],
        expandedIds: new Set(),
        selectedIds: new Set(),
        focusedId: null,
        editingId: null,
        draggedId: null,
        dropTargetId: null,
        dropPosition: null,
      },
    });

    // Create a map to track folder IDs
    const folderMap = new Map<string, string>();
    const requestMap = new Map<string, SavedRequest>();
    const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();

    // First, create all folders
    const createFolderRecursive = (folder: SavedFolder, parentId: string | null = null) => {
      const nodeId = createNode(parentId, 'folder', folder.name);
      folderMap.set(folder.id, nodeId);
      nodeMap.set(nodeId, { type: 'folder', id: folder.id });

      // Process subfolder IDs
      folder.subFolderIds.forEach((subFolderId) => {
        const subFolder = savedFolders.find((f) => f.id === subFolderId);
        if (subFolder) {
          createFolderRecursive(subFolder, nodeId);
        }
      });

      // Process request IDs in this folder
      folder.requestIds.forEach((requestId) => {
        const request = savedRequests.find((r) => r.id === requestId);
        if (request) {
          const requestNodeId = createNode(nodeId, 'request', request.name);
          requestMap.set(requestNodeId, request);
          nodeMap.set(requestNodeId, { type: 'request', id: request.id });

          // Update node metadata with request info
          const nodes = useFolderTreeStore.getState().treeState.nodes;
          const node = nodes.get(requestNodeId);
          if (node) {
            nodes.set(requestNodeId, {
              ...node,
              metadata: {
                method: request.method,
                url: request.url,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            });
          }
        }
      });
    };

    // Create root folders
    savedFolders
      .filter((folder) => !folder.parentFolderId)
      .forEach((folder) => createFolderRecursive(folder));

    // Create orphaned requests (not in any folder)
    const requestsInFolders = new Set(savedFolders.flatMap((folder) => folder.requestIds));

    savedRequests
      .filter((request) => !requestsInFolders.has(request.id))
      .forEach((request) => {
        const nodeId = createNode(null, 'request', request.name);
        requestMap.set(nodeId, request);
        nodeMap.set(nodeId, { type: 'request', id: request.id });

        // Update node metadata
        const nodes = useFolderTreeStore.getState().treeState.nodes;
        const node = nodes.get(nodeId);
        if (node) {
          nodes.set(nodeId, {
            ...node,
            metadata: {
              method: request.method,
              url: request.url,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          });
        }
      });

    // Store the mappings for later use
    (
      window as unknown as {
        __folderTreeRequestMap?: Map<string, SavedRequest>;
        __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
      }
    ).__folderTreeRequestMap = requestMap;
    (
      window as unknown as {
        __folderTreeRequestMap?: Map<string, SavedRequest>;
        __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
      }
    ).__folderTreeNodeMap = nodeMap;
  }, [savedRequests, savedFolders, createNode]);

  // Handle opening a request
  const handleOpenRequest = (nodeId: string) => {
    const requestMap = (window as unknown as { __folderTreeRequestMap?: Map<string, SavedRequest> })
      .__folderTreeRequestMap;
    const request = requestMap?.get(nodeId);
    if (request && onOpenRequest) {
      onOpenRequest(request);
    }
  };

  // Choose which component to render
  const TreeComponent = useVirtualization ? VirtualizedFolderTree : FolderTree;

  return <TreeComponent onOpenRequest={handleOpenRequest} className={className} />;
};
