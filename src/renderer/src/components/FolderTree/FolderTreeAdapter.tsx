import React, { useEffect, useRef } from 'react';
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
  const { createNode, deleteNode, sortChildren } = useFolderTreeStore();

  // Enable syncing operations back to savedRequestsStore
  useFolderTreeSync();

  // Keep track of whether we've initialized
  const isInitialized = useRef(false);
  const previousDataRef = useRef<{ folders: SavedFolder[]; requests: SavedRequest[] }>({
    folders: [],
    requests: [],
  });

  // Maintain stable mappings between saved items and tree nodes
  const folderNodeMap = useRef<Map<string, string>>(new Map());
  const requestNodeMap = useRef<Map<string, string>>(new Map());
  const nodeTypeMap = useRef<Map<string, { type: 'folder' | 'request'; id: string }>>(new Map());

  // Sync savedRequestsStore data to folderTreeStore
  useEffect(() => {
    // First-time initialization
    if (!isInitialized.current) {
      // Clear any existing data and mappings
      folderNodeMap.current.clear();
      requestNodeMap.current.clear();
      nodeTypeMap.current.clear();

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
    }

    const currentState = useFolderTreeStore.getState().treeState;
    const currentFolderIds = new Set(savedFolders.map((f) => f.id));
    const currentRequestIds = new Set(savedRequests.map((r) => r.id));
    const previousFolderIds = new Set(previousDataRef.current.folders.map((f) => f.id));
    const previousRequestIds = new Set(previousDataRef.current.requests.map((r) => r.id));

    // Find added and removed items
    const addedFolders = savedFolders.filter((f) => !previousFolderIds.has(f.id));
    const removedFolderIds = Array.from(previousFolderIds).filter(
      (id) => !currentFolderIds.has(id),
    );
    const addedRequests = savedRequests.filter((r) => !previousRequestIds.has(r.id));
    const removedRequestIds = Array.from(previousRequestIds).filter(
      (id) => !currentRequestIds.has(id),
    );

    // Handle removed items
    [...removedFolderIds, ...removedRequestIds].forEach((id) => {
      const nodeId = folderNodeMap.current.get(id) || requestNodeMap.current.get(id);
      if (nodeId) {
        deleteNode(nodeId);
        folderNodeMap.current.delete(id);
        requestNodeMap.current.delete(id);
        nodeTypeMap.current.delete(nodeId);
      }
    });

    // Helper function to create or get existing node
    const getOrCreateFolder = (folder: SavedFolder): string => {
      // Check if we already have a node ID for this folder
      const existingNodeId = folderNodeMap.current.get(folder.id);
      if (existingNodeId) {
        // Verify the node still exists in the tree
        const currentTreeState = useFolderTreeStore.getState().treeState;
        if (currentTreeState.nodes.has(existingNodeId)) {
          return existingNodeId;
        }
      }

      // Find parent node ID if folder has parent
      let parentNodeId: string | null = null;
      if (folder.parentFolderId) {
        // Check if parent already has a node
        const parentExistingNodeId = folderNodeMap.current.get(folder.parentFolderId);
        if (parentExistingNodeId) {
          const currentTreeState = useFolderTreeStore.getState().treeState;
          if (currentTreeState.nodes.has(parentExistingNodeId)) {
            parentNodeId = parentExistingNodeId;
          }
        }

        // If parent doesn't have a node yet, we'll handle it in the tree building process
        if (!parentNodeId) {
          return ''; // Return empty string to indicate this folder needs to wait for parent
        }
      }

      const nodeId = createNode(parentNodeId, 'folder', folder.name, isInitialized.current);
      folderNodeMap.current.set(folder.id, nodeId);
      nodeTypeMap.current.set(nodeId, { type: 'folder', id: folder.id });

      // Auto-expand on initial load if has children
      if (!isInitialized.current) {
        const hasChildren =
          savedFolders.some((f) => f.parentFolderId === folder.id) || folder.requestIds.length > 0;
        if (hasChildren) {
          useFolderTreeStore.setState((state) => ({
            treeState: {
              ...state.treeState,
              expandedIds: new Set([...state.treeState.expandedIds, nodeId]),
            },
          }));
        }
      }

      return nodeId;
    };

    const getOrCreateRequest = (request: SavedRequest, parentNodeId: string | null): string => {
      const existingNodeId = requestNodeMap.current.get(request.id);
      if (existingNodeId && currentState.nodes.has(existingNodeId)) {
        return existingNodeId;
      }

      const nodeId = createNode(parentNodeId, 'request', request.name, isInitialized.current);
      requestNodeMap.current.set(request.id, nodeId);
      nodeTypeMap.current.set(nodeId, { type: 'request', id: request.id });

      // Update node metadata
      useFolderTreeStore.setState((state) => {
        const nodes = new Map(state.treeState.nodes);
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

        return {
          treeState: { ...state.treeState, nodes },
        };
      });

      return nodeId;
    };

    // Process all folders to ensure hierarchy is correct
    if (!isInitialized.current || addedFolders.length > 0 || removedFolderIds.length > 0) {
      // Clear and rebuild the folder structure to ensure correct hierarchy
      // First, identify all root folders and build from there
      const processedFolders = new Set<string>();

      const buildFolderTree = (folderId: string) => {
        if (processedFolders.has(folderId)) return;

        const folder = savedFolders.find((f) => f.id === folderId);
        if (!folder) return;

        processedFolders.add(folderId);
        const nodeId = getOrCreateFolder(folder);

        // Only process children if the folder was successfully created
        if (nodeId) {
          // Process child folders
          savedFolders
            .filter((f) => f.parentFolderId === folderId)
            .forEach((childFolder) => buildFolderTree(childFolder.id));
        }
      };

      // Start with root folders
      savedFolders.filter((f) => !f.parentFolderId).forEach((folder) => buildFolderTree(folder.id));
    }

    // Process all requests
    if (!isInitialized.current || addedRequests.length > 0 || removedRequestIds.length > 0) {
      // Rebuild request placement to ensure they're in the correct folders
      savedRequests.forEach((request) => {
        // Find which folder contains this request
        const containingFolder = savedFolders.find((f) => f.requestIds.includes(request.id));
        const parentNodeId = containingFolder
          ? folderNodeMap.current.get(containingFolder.id) || null
          : null;
        getOrCreateRequest(request, parentNodeId);
      });
    }

    // Update the window mappings for sync operations
    const requestMap = new Map<string, SavedRequest>();
    savedRequests.forEach((request) => {
      const nodeId = requestNodeMap.current.get(request.id);
      if (nodeId) {
        requestMap.set(nodeId, request);
      }
    });

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
    ).__folderTreeNodeMap = nodeTypeMap.current;

    // Store current data for next comparison
    previousDataRef.current = {
      folders: [...savedFolders],
      requests: [...savedRequests],
    };

    // Sort all nodes after initialization/updates
    if (
      !isInitialized.current ||
      addedFolders.length > 0 ||
      removedFolderIds.length > 0 ||
      addedRequests.length > 0 ||
      removedRequestIds.length > 0
    ) {
      // Sort root level
      sortChildren(null);

      // Sort all folder children
      const currentTreeState = useFolderTreeStore.getState().treeState;
      currentTreeState.nodes.forEach((node) => {
        if (node.type === 'folder' && node.children.length > 0) {
          sortChildren(node.id);
        }
      });
    }

    isInitialized.current = true;
  }, [savedRequests, savedFolders, createNode, deleteNode, sortChildren]);

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
