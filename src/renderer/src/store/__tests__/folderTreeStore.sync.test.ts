import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFolderTreeStore } from '../folderTreeStore';
import { useSavedRequestsStore } from '../savedRequestsStore';
import { useFolderTreeSync } from '../../hooks/useFolderTreeSync';

// Define window extension type
interface ExtendedWindow extends Window {
  __folderTreeHandleEndEditing?: (nodeId: string, newName: string) => void;
  __folderTreeHandleMove?: (
    nodeId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside',
  ) => void;
  __folderTreeHandleDelete?: (nodeIds: string[]) => void;
  __folderTreeNodeMap?: Map<string, { type: 'folder' | 'request'; id: string }>;
}

describe('FolderTreeStore synchronization', () => {
  beforeEach(() => {
    // Clear all stores
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

    useSavedRequestsStore.setState({
      savedRequests: [],
      savedFolders: [],
    });

    // Clear window handlers
    const extWindow = window as ExtendedWindow;
    extWindow.__folderTreeHandleEndEditing = undefined;
    extWindow.__folderTreeHandleMove = undefined;
    extWindow.__folderTreeHandleDelete = undefined;
    extWindow.__folderTreeNodeMap = undefined;
  });

  describe('Rename synchronization', () => {
    it('should sync request rename to savedRequestsStore', () => {
      // Arrange
      const requestId = 'request-1';
      const nodeId = 'node-1';
      const originalName = 'Original Request';
      const newName = 'Renamed Request';

      // Set up initial state
      useSavedRequestsStore.setState({
        savedRequests: [
          {
            id: requestId,
            name: originalName,
            method: 'GET',
            url: 'https://api.example.com',
            headers: [],
            body: [],
            params: [],
          },
        ],
        savedFolders: [],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(nodeId, { type: 'request', id: requestId });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree node
      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes: new Map([
            [
              nodeId,
              {
                id: nodeId,
                name: originalName,
                type: 'request',
                parentId: null,
                children: [],
                metadata: {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
            ],
          ]),
          rootIds: [nodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act
      act(() => {
        useFolderTreeStore.getState().endEditing(nodeId, newName);
      });

      // Assert
      const updatedRequest = useSavedRequestsStore.getState().savedRequests[0];
      expect(updatedRequest.name).toBe(newName);
    });

    it('should sync folder rename to savedRequestsStore', () => {
      // Arrange
      const folderId = 'folder-1';
      const nodeId = 'node-1';
      const originalName = 'Original Folder';
      const newName = 'Renamed Folder';

      // Set up initial state
      useSavedRequestsStore.setState({
        savedRequests: [],
        savedFolders: [
          {
            id: folderId,
            name: originalName,
            parentFolderId: null,
            requestIds: [],
          },
        ],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(nodeId, { type: 'folder', id: folderId });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree node
      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes: new Map([
            [
              nodeId,
              {
                id: nodeId,
                name: originalName,
                type: 'folder',
                parentId: null,
                children: [],
                metadata: {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
            ],
          ]),
          rootIds: [nodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act
      act(() => {
        useFolderTreeStore.getState().endEditing(nodeId, newName);
      });

      // Assert
      const updatedFolder = useSavedRequestsStore.getState().savedFolders[0];
      expect(updatedFolder.name).toBe(newName);
    });

    it('should not sync if name is not changed', () => {
      // Arrange
      const nodeId = 'node-1';
      const sameName = 'Same Name';
      const updateRequestSpy = vi.spyOn(useSavedRequestsStore.getState(), 'updateRequest');

      // Set up the tree node
      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes: new Map([
            [
              nodeId,
              {
                id: nodeId,
                name: sameName,
                type: 'request',
                parentId: null,
                children: [],
                metadata: {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
            ],
          ]),
          rootIds: [nodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act
      act(() => {
        useFolderTreeStore.getState().endEditing(nodeId, sameName);
      });

      // Assert
      expect(updateRequestSpy).not.toHaveBeenCalled();
    });
  });

  describe('Move (drag-and-drop) synchronization', () => {
    it('should sync request move to folder', () => {
      // Arrange
      const requestId = 'request-1';
      const folderId = 'folder-1';
      const requestNodeId = 'node-1';
      const folderNodeId = 'node-2';

      // Set up initial state
      useSavedRequestsStore.setState({
        savedRequests: [
          {
            id: requestId,
            name: 'Test Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: [],
            body: [],
            params: [],
          },
        ],
        savedFolders: [
          {
            id: folderId,
            name: 'Test Folder',
            parentFolderId: null,
            requestIds: [],
          },
        ],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(requestNodeId, { type: 'request', id: requestId });
      nodeMap.set(folderNodeId, { type: 'folder', id: folderId });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree nodes
      const nodes = new Map();
      nodes.set(requestNodeId, {
        id: requestNodeId,
        name: 'Test Request',
        type: 'request',
        parentId: null,
        children: [],
        metadata: {},
      });
      nodes.set(folderNodeId, {
        id: folderNodeId,
        name: 'Test Folder',
        type: 'folder',
        parentId: null,
        children: [],
        metadata: {},
      });

      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes,
          rootIds: [requestNodeId, folderNodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act
      act(() => {
        useFolderTreeStore.getState().moveNode(requestNodeId, folderNodeId, 'inside');
      });

      // Assert
      const updatedFolder = useSavedRequestsStore.getState().savedFolders[0];
      expect(updatedFolder.requestIds).toContain(requestId);
    });

    it('should sync folder move to another folder', () => {
      // Arrange
      const childFolderId = 'folder-1';
      const parentFolderId = 'folder-2';
      const childNodeId = 'node-1';
      const parentNodeId = 'node-2';

      // Set up initial state
      useSavedRequestsStore.setState({
        savedRequests: [],
        savedFolders: [
          {
            id: childFolderId,
            name: 'Child Folder',
            parentFolderId: null,
            requestIds: [],
          },
          {
            id: parentFolderId,
            name: 'Parent Folder',
            parentFolderId: null,
            requestIds: [],
          },
        ],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(childNodeId, { type: 'folder', id: childFolderId });
      nodeMap.set(parentNodeId, { type: 'folder', id: parentFolderId });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree nodes
      const nodes = new Map();
      nodes.set(childNodeId, {
        id: childNodeId,
        name: 'Child Folder',
        type: 'folder',
        parentId: null,
        children: [],
        metadata: {},
      });
      nodes.set(parentNodeId, {
        id: parentNodeId,
        name: 'Parent Folder',
        type: 'folder',
        parentId: null,
        children: [],
        metadata: {},
      });

      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes,
          rootIds: [childNodeId, parentNodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act
      act(() => {
        useFolderTreeStore.getState().moveNode(childNodeId, parentNodeId, 'inside');
      });

      // Assert
      const folders = useSavedRequestsStore.getState().savedFolders;
      const movedFolder = folders.find((f) => f.id === childFolderId);
      expect(movedFolder?.parentFolderId).toBe(parentFolderId);
    });

    it('should sync request move to root level when moved before/after root item', () => {
      // Arrange
      const requestId = 'request-1';
      const folderId = 'folder-1';
      const requestNodeId = 'node-1';
      const folderNodeId = 'node-2';
      const anotherRequestNodeId = 'node-3';

      // Set up initial state - request initially in folder
      useSavedRequestsStore.setState({
        savedRequests: [
          {
            id: requestId,
            name: 'Test Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: [],
            body: [],
            params: [],
          },
        ],
        savedFolders: [
          {
            id: folderId,
            name: 'Test Folder',
            parentFolderId: null,
            requestIds: [requestId],
          },
        ],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(requestNodeId, { type: 'request', id: requestId });
      nodeMap.set(folderNodeId, { type: 'folder', id: folderId });
      nodeMap.set(anotherRequestNodeId, { type: 'request', id: 'another-request' });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree nodes - request is inside folder
      const nodes = new Map();
      nodes.set(requestNodeId, {
        id: requestNodeId,
        name: 'Test Request',
        type: 'request',
        parentId: folderNodeId,
        children: [],
        metadata: {},
      });
      nodes.set(folderNodeId, {
        id: folderNodeId,
        name: 'Test Folder',
        type: 'folder',
        parentId: null,
        children: [requestNodeId],
        metadata: {},
      });
      nodes.set(anotherRequestNodeId, {
        id: anotherRequestNodeId,
        name: 'Another Request',
        type: 'request',
        parentId: null,
        children: [],
        metadata: {},
      });

      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes,
          rootIds: [folderNodeId, anotherRequestNodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act - move request to root level (before another request at root)
      act(() => {
        useFolderTreeStore.getState().moveNode(requestNodeId, anotherRequestNodeId, 'before');
      });

      // Assert
      const updatedFolder = useSavedRequestsStore.getState().savedFolders[0];
      expect(updatedFolder.requestIds).not.toContain(requestId);
    });
  });

  describe('Delete synchronization', () => {
    it('should sync request delete', () => {
      // Arrange
      const requestId = 'request-1';
      const nodeId = 'node-1';

      // Set up initial state
      useSavedRequestsStore.setState({
        savedRequests: [
          {
            id: requestId,
            name: 'Test Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: [],
            body: [],
            params: [],
          },
        ],
        savedFolders: [],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(nodeId, { type: 'request', id: requestId });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree node
      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes: new Map([
            [
              nodeId,
              {
                id: nodeId,
                name: 'Test Request',
                type: 'request',
                parentId: null,
                children: [],
                metadata: {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
            ],
          ]),
          rootIds: [nodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act
      act(() => {
        useFolderTreeStore.getState().deleteNode(nodeId);
      });

      // Assert
      expect(useSavedRequestsStore.getState().savedRequests).toHaveLength(0);
    });

    it('should sync folder delete with all children', () => {
      // Arrange
      const parentFolderId = 'folder-1';
      const childFolderId = 'folder-2';
      const requestId = 'request-1';
      const parentNodeId = 'node-1';
      const childNodeId = 'node-2';
      const requestNodeId = 'node-3';

      // Set up initial state
      useSavedRequestsStore.setState({
        savedRequests: [
          {
            id: requestId,
            name: 'Test Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: [],
            body: [],
            params: [],
          },
        ],
        savedFolders: [
          {
            id: parentFolderId,
            name: 'Parent Folder',
            parentFolderId: null,
            requestIds: [],
          },
          {
            id: childFolderId,
            name: 'Child Folder',
            parentFolderId: parentFolderId,
            requestIds: [requestId],
          },
        ],
      });

      // Set up the node map
      const nodeMap = new Map<string, { type: 'folder' | 'request'; id: string }>();
      nodeMap.set(parentNodeId, { type: 'folder', id: parentFolderId });
      nodeMap.set(childNodeId, { type: 'folder', id: childFolderId });
      nodeMap.set(requestNodeId, { type: 'request', id: requestId });
      (window as ExtendedWindow).__folderTreeNodeMap = nodeMap;

      // Set up the tree nodes
      const nodes = new Map();
      nodes.set(parentNodeId, {
        id: parentNodeId,
        name: 'Parent Folder',
        type: 'folder',
        parentId: null,
        children: [childNodeId],
        metadata: {},
      });
      nodes.set(childNodeId, {
        id: childNodeId,
        name: 'Child Folder',
        type: 'folder',
        parentId: parentNodeId,
        children: [requestNodeId],
        metadata: {},
      });
      nodes.set(requestNodeId, {
        id: requestNodeId,
        name: 'Test Request',
        type: 'request',
        parentId: childNodeId,
        children: [],
        metadata: {},
      });

      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes,
          rootIds: [parentNodeId],
        },
      });

      // Enable sync
      renderHook(() => useFolderTreeSync());

      // Act - delete parent folder (should delete all children)
      act(() => {
        useFolderTreeStore.getState().deleteNode(parentNodeId);
      });

      // Assert
      expect(useSavedRequestsStore.getState().savedFolders).toHaveLength(0);
      expect(useSavedRequestsStore.getState().savedRequests).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle operations when sync handlers are not set', () => {
      // Arrange
      const nodeId = 'node-1';

      // Don't enable sync (no handlers set)

      // Set up the tree node
      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes: new Map([
            [
              nodeId,
              {
                id: nodeId,
                name: 'Test',
                type: 'request',
                parentId: null,
                children: [],
                metadata: {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
            ],
          ]),
          rootIds: [nodeId],
        },
      });

      // Act & Assert - should not throw
      expect(() => {
        act(() => {
          useFolderTreeStore.getState().endEditing(nodeId, 'New Name');
          useFolderTreeStore.getState().moveNode(nodeId, nodeId, 'after');
          useFolderTreeStore.getState().deleteNode(nodeId);
        });
      }).not.toThrow();
    });

    it('should handle operations when node mapping is missing', () => {
      // Arrange
      const nodeId = 'node-1';
      const requestId = 'request-1';

      // Set up a request in the store
      useSavedRequestsStore.setState({
        savedRequests: [
          {
            id: requestId,
            name: 'Test Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: [],
            body: [],
            params: [],
          },
        ],
        savedFolders: [],
      });

      // Enable sync but don't set up node mapping
      renderHook(() => useFolderTreeSync());

      // Set up the tree node
      useFolderTreeStore.setState({
        treeState: {
          ...useFolderTreeStore.getState().treeState,
          nodes: new Map([
            [
              nodeId,
              {
                id: nodeId,
                name: 'Test',
                type: 'request',
                parentId: null,
                children: [],
                metadata: {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
            ],
          ]),
          rootIds: [nodeId],
        },
      });

      // Act
      act(() => {
        useFolderTreeStore.getState().endEditing(nodeId, 'New Name');
      });

      // Assert - should not update savedRequestsStore when mapping is missing
      expect(useSavedRequestsStore.getState().savedRequests[0].name).toBe('Test Request');
    });
  });
});
