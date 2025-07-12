import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { FolderTree } from '../index';
import { useFolderTreeStore } from '../../../store/folderTreeStore';

describe('FolderTree', () => {
  beforeEach(() => {
    // Reset store before each test
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
  });

  it('should render empty tree', () => {
    const { container } = render(<FolderTree />);
    expect(container.querySelector('[role="tree"]')).toBeTruthy();
  });

  it('should render tree nodes', () => {
    const { createNode } = useFolderTreeStore.getState();
    const folderId = createNode(null, 'folder', 'Test Folder');
    createNode(folderId, 'request', 'Test Request');

    const { container } = render(<FolderTree />);
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(1);
  });

  it('should expand folder on click', () => {
    const { createNode } = useFolderTreeStore.getState();
    const folderId = createNode(null, 'folder', 'Test Folder');
    createNode(folderId, 'request', 'Test Request');

    const { container } = render(<FolderTree />);
    const chevron = container.querySelector('button[aria-label*="Expand"]');

    fireEvent.click(chevron!);

    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(2);
  });

  it('should select node on click', () => {
    const { createNode } = useFolderTreeStore.getState();
    createNode(null, 'folder', 'Test Folder');

    const { container } = render(<FolderTree />);
    const node = container.querySelector('[role="treeitem"]');

    fireEvent.click(node!);

    const state = useFolderTreeStore.getState().treeState;
    expect(state.selectedIds.size).toBe(1);
  });
});
