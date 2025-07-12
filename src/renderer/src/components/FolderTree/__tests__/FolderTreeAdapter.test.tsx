import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FolderTreeAdapter } from '../FolderTreeAdapter';
import { useSavedRequestsStore } from '../../../store/savedRequestsStore';
import { useFolderTreeStore } from '../../../store/folderTreeStore';

describe('FolderTreeAdapter', () => {
  beforeEach(() => {
    // Reset stores before each test
    useSavedRequestsStore.setState({
      savedRequests: [],
      savedFolders: [],
    });

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

    // Clear window mappings
    (window as unknown as { __folderTreeRequestMap?: unknown }).__folderTreeRequestMap = undefined;
    (window as unknown as { __folderTreeNodeMap?: unknown }).__folderTreeNodeMap = undefined;
  });

  it('should sync folders and requests from savedRequestsStore', () => {
    // Add test data to savedRequestsStore
    const { addFolder, addRequest } = useSavedRequestsStore.getState();

    const folderId = addFolder({
      name: 'Test Folder',
      parentFolderId: null,
      requestIds: [],
    });

    const requestId = addRequest({
      name: 'Test Request',
      method: 'GET',
      url: 'https://example.com',
      headers: [],
      body: [],
      params: [],
    });

    // Update folder with request
    useSavedRequestsStore.getState().updateFolder(folderId, {
      requestIds: [requestId],
    });

    // Render adapter
    render(<FolderTreeAdapter />);

    // Check that nodes were created in folderTreeStore
    const { treeState } = useFolderTreeStore.getState();
    expect(treeState.nodes.size).toBe(2); // 1 folder + 1 request
    expect(treeState.rootIds).toHaveLength(1); // 1 root folder

    // Check mappings were created
    expect(
      (window as unknown as { __folderTreeRequestMap?: unknown }).__folderTreeRequestMap,
    ).toBeDefined();
    expect(
      (window as unknown as { __folderTreeNodeMap?: unknown }).__folderTreeNodeMap,
    ).toBeDefined();
  });

  it('should handle requests without folders', () => {
    // Add orphaned request
    const { addRequest } = useSavedRequestsStore.getState();

    addRequest({
      name: 'Orphaned Request',
      method: 'POST',
      url: 'https://example.com/api',
      headers: [],
      body: [],
      params: [],
    });

    render(<FolderTreeAdapter />);

    // Check that the request node was created at root level
    const { treeState } = useFolderTreeStore.getState();
    expect(treeState.nodes.size).toBe(1);
    expect(treeState.rootIds).toHaveLength(1);
  });

  it('should handle nested folders', () => {
    const { addFolder } = useSavedRequestsStore.getState();

    const parentId = addFolder({
      name: 'Parent Folder',
      parentFolderId: null,
      requestIds: [],
    });

    addFolder({
      name: 'Child Folder',
      parentFolderId: parentId,
      requestIds: [],
    });

    // No need to update parent - hierarchy is maintained by parentFolderId

    render(<FolderTreeAdapter />);

    // Check folder hierarchy
    const { treeState } = useFolderTreeStore.getState();
    expect(treeState.nodes.size).toBe(2);
    expect(treeState.rootIds).toHaveLength(1);

    // Find parent node
    const parentNode = Array.from(treeState.nodes.values()).find(
      (node) => node.name === 'Parent Folder',
    );
    expect(parentNode).toBeDefined();
    expect(parentNode?.children).toHaveLength(1);
  });

  it('should sort folders first, then requests, and by name', () => {
    const { addFolder, addRequest } = useSavedRequestsStore.getState();

    // Create folders and requests in random order
    addFolder({
      name: 'Z Folder',
      parentFolderId: null,
      requestIds: [],
    });

    addRequest({
      name: 'A Request',
      method: 'GET',
      url: 'https://example.com/a',
      headers: [],
      body: [],
      params: [],
    });

    addFolder({
      name: 'A Folder',
      parentFolderId: null,
      requestIds: [],
    });

    addRequest({
      name: 'Z Request',
      method: 'POST',
      url: 'https://example.com/z',
      headers: [],
      body: [],
      params: [],
    });

    render(<FolderTreeAdapter />);

    const { treeState } = useFolderTreeStore.getState();
    const rootNodes = treeState.rootIds.map((id) => treeState.nodes.get(id)).filter(Boolean);

    // Should be sorted: A Folder, Z Folder, A Request, Z Request
    expect(rootNodes).toHaveLength(4);
    expect(rootNodes[0]?.type).toBe('folder');
    expect(rootNodes[0]?.name).toBe('A Folder');
    expect(rootNodes[1]?.type).toBe('folder');
    expect(rootNodes[1]?.name).toBe('Z Folder');
    expect(rootNodes[2]?.type).toBe('request');
    expect(rootNodes[2]?.name).toBe('A Request');
    expect(rootNodes[3]?.type).toBe('request');
    expect(rootNodes[3]?.name).toBe('Z Request');
  });

  it('should maintain sort order after drag and drop operations', () => {
    const { addFolder, addRequest } = useSavedRequestsStore.getState();

    // Create a folder and some items
    addFolder({
      name: 'Parent Folder',
      parentFolderId: null,
      requestIds: [],
    });

    addRequest({
      name: 'B Request',
      method: 'GET',
      url: 'https://example.com/b',
      headers: [],
      body: [],
      params: [],
    });

    addFolder({
      name: 'A Child Folder',
      parentFolderId: null,
      requestIds: [],
    });

    render(<FolderTreeAdapter />);

    const { moveNode } = useFolderTreeStore.getState();

    // Move the request into the parent folder
    const requestNodeId = Array.from(useFolderTreeStore.getState().treeState.nodes.values()).find(
      (node) => node.name === 'B Request',
    )?.id;
    const parentNodeId = Array.from(useFolderTreeStore.getState().treeState.nodes.values()).find(
      (node) => node.name === 'Parent Folder',
    )?.id;

    expect(requestNodeId).toBeDefined();
    expect(parentNodeId).toBeDefined();

    if (requestNodeId && parentNodeId) {
      moveNode(requestNodeId, parentNodeId, 'inside');
    }

    // Check that items are still sorted correctly
    const { treeState } = useFolderTreeStore.getState();
    const rootNodes = treeState.rootIds.map((id) => treeState.nodes.get(id)).filter(Boolean);

    // Root should have: A Child Folder, Parent Folder (both folders sorted by name)
    expect(rootNodes).toHaveLength(2);
    expect(rootNodes[0]?.type).toBe('folder');
    expect(rootNodes[0]?.name).toBe('A Child Folder');
    expect(rootNodes[1]?.type).toBe('folder');
    expect(rootNodes[1]?.name).toBe('Parent Folder');

    // Check that the request is now inside Parent Folder and sorted
    const parentNode = treeState.nodes.get(parentNodeId!);
    expect(parentNode?.children).toHaveLength(1);
    const childInParent = treeState.nodes.get(parentNode!.children[0]);
    expect(childInParent?.name).toBe('B Request');
  });

  it('should sort items correctly within folders after drag and drop', () => {
    const { addFolder, addRequest } = useSavedRequestsStore.getState();

    // Create a parent folder
    addFolder({
      name: 'Parent Folder',
      parentFolderId: null,
      requestIds: [],
    });

    // Create items that will be moved into the folder
    addRequest({
      name: 'Z Request',
      method: 'GET',
      url: 'https://example.com/z',
      headers: [],
      body: [],
      params: [],
    });

    addFolder({
      name: 'B Subfolder',
      parentFolderId: null,
      requestIds: [],
    });

    addRequest({
      name: 'A Request',
      method: 'POST',
      url: 'https://example.com/a',
      headers: [],
      body: [],
      params: [],
    });

    render(<FolderTreeAdapter />);

    const { moveNode } = useFolderTreeStore.getState();

    // Get node IDs
    const parentNodeId = Array.from(useFolderTreeStore.getState().treeState.nodes.values()).find(
      (node) => node.name === 'Parent Folder',
    )?.id;
    const zRequestNodeId = Array.from(useFolderTreeStore.getState().treeState.nodes.values()).find(
      (node) => node.name === 'Z Request',
    )?.id;
    const subfolderNodeId = Array.from(useFolderTreeStore.getState().treeState.nodes.values()).find(
      (node) => node.name === 'B Subfolder',
    )?.id;
    const aRequestNodeId = Array.from(useFolderTreeStore.getState().treeState.nodes.values()).find(
      (node) => node.name === 'A Request',
    )?.id;

    // Move all items into the parent folder
    if (parentNodeId && zRequestNodeId && subfolderNodeId && aRequestNodeId) {
      moveNode(zRequestNodeId, parentNodeId, 'inside');
      moveNode(subfolderNodeId, parentNodeId, 'inside');
      moveNode(aRequestNodeId, parentNodeId, 'inside');
    }

    // Check that items are sorted within the parent folder: B Subfolder, A Request, Z Request
    const { treeState } = useFolderTreeStore.getState();
    const parentNode = treeState.nodes.get(parentNodeId!);
    expect(parentNode?.children).toHaveLength(3);

    const childNodes = parentNode!.children.map((id) => treeState.nodes.get(id)!);
    expect(childNodes[0].type).toBe('folder');
    expect(childNodes[0].name).toBe('B Subfolder');
    expect(childNodes[1].type).toBe('request');
    expect(childNodes[1].name).toBe('A Request');
    expect(childNodes[2].type).toBe('request');
    expect(childNodes[2].name).toBe('Z Request');
  });

  it('should call onOpenRequest when a request is opened', () => {
    const onOpenRequest = vi.fn();
    const { addRequest } = useSavedRequestsStore.getState();

    const requestId = addRequest({
      name: 'Test Request',
      method: 'GET',
      url: 'https://example.com',
      headers: [],
      body: [],
      params: [],
    });

    render(<FolderTreeAdapter onOpenRequest={onOpenRequest} />);

    // Get the node ID for the request
    const nodeMap = (
      window as unknown as { __folderTreeNodeMap?: Map<string, { type: string; id: string }> }
    ).__folderTreeNodeMap;
    const requestNodeId = nodeMap
      ? Array.from(nodeMap.entries()).find(([, mapping]) => mapping.id === requestId)?.[0]
      : undefined;

    expect(requestNodeId).toBeDefined();

    // Simulate opening the request
    const adapter = render(<FolderTreeAdapter onOpenRequest={onOpenRequest} />);
    const tree = adapter.container.querySelector('[role="tree"]');
    expect(tree).toBeTruthy();
  });

  it('should auto-expand parent folder when creating a new child folder', () => {
    const { addFolder } = useSavedRequestsStore.getState();

    // Create a parent folder and render the adapter
    const parentId = addFolder({
      name: 'Parent Folder',
      parentFolderId: null,
      requestIds: [],
    });

    const { rerender } = render(<FolderTreeAdapter />);

    // Initially the parent folder should be collapsed
    const { treeState } = useFolderTreeStore.getState();
    const parentNodeId = Array.from(treeState.nodes.values()).find(
      (node) => node.name === 'Parent Folder',
    )?.id;

    expect(parentNodeId).toBeDefined();
    expect(treeState.expandedIds.has(parentNodeId!)).toBe(false);

    // Create a child folder (this happens after initialization)
    addFolder({
      name: 'Child Folder',
      parentFolderId: parentId,
      requestIds: [],
    });

    // Re-render to trigger the adapter logic with new data
    rerender(<FolderTreeAdapter />);

    // Now the parent folder should be expanded
    const updatedTreeState = useFolderTreeStore.getState().treeState;
    expect(updatedTreeState.expandedIds.has(parentNodeId!)).toBe(true);

    // Verify the child folder exists
    const childNode = Array.from(updatedTreeState.nodes.values()).find(
      (node) => node.name === 'Child Folder',
    );
    expect(childNode).toBeDefined();
    expect(childNode?.parentId).toBe(parentNodeId);
  });

  it('should auto-expand parent folder when creating a new request in it', () => {
    const { addFolder, addRequest } = useSavedRequestsStore.getState();

    // Create a parent folder and render the adapter
    const parentId = addFolder({
      name: 'Parent Folder',
      parentFolderId: null,
      requestIds: [],
    });

    const { rerender } = render(<FolderTreeAdapter />);

    // Initially the parent folder should be collapsed
    const { treeState } = useFolderTreeStore.getState();
    const parentNodeId = Array.from(treeState.nodes.values()).find(
      (node) => node.name === 'Parent Folder',
    )?.id;

    expect(parentNodeId).toBeDefined();
    expect(treeState.expandedIds.has(parentNodeId!)).toBe(false);

    // Create a request and add it to the folder (this happens after initialization)
    const requestId = addRequest({
      name: 'Test Request',
      method: 'GET',
      url: 'https://example.com',
      headers: [],
      body: [],
      params: [],
    });

    // Update folder with the request
    useSavedRequestsStore.getState().updateFolder(parentId, {
      requestIds: [requestId],
    });

    // Re-render to trigger the adapter logic with new data
    rerender(<FolderTreeAdapter />);

    // Now the parent folder should be expanded
    const updatedTreeState = useFolderTreeStore.getState().treeState;
    expect(updatedTreeState.expandedIds.has(parentNodeId!)).toBe(true);

    // Verify the request exists in the folder
    const parentNode = updatedTreeState.nodes.get(parentNodeId!);
    expect(parentNode?.children).toHaveLength(1);

    const requestNode = updatedTreeState.nodes.get(parentNode!.children[0]);
    expect(requestNode?.name).toBe('Test Request');
    expect(requestNode?.type).toBe('request');
  });
});
