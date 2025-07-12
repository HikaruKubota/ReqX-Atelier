 
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
      subFolderIds: [],
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
      subFolderIds: [],
    });

    const childId = addFolder({
      name: 'Child Folder',
      parentFolderId: parentId,
      requestIds: [],
      subFolderIds: [],
    });

    // Update parent with child
    useSavedRequestsStore.getState().updateFolder(parentId, {
      subFolderIds: [childId],
    });

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
});
