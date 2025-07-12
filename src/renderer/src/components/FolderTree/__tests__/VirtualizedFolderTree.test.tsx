import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualizedFolderTree } from '../VirtualizedFolderTree';
import { useFolderTreeStore } from '../../../store/folderTreeStore';

// Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      {
        key: 'item-0',
        index: 0,
        start: 0,
        size: 28,
      },
    ],
    getTotalSize: () => 28,
    scrollToIndex: vi.fn(),
  }),
}));

describe('VirtualizedFolderTree', () => {
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

  it('should render with virtual scrolling', () => {
    const { createNode } = useFolderTreeStore.getState();
    createNode(null, 'folder', 'Test Folder');

    const { container } = render(<VirtualizedFolderTree />);

    // Check for virtual scrolling container
    const scrollContainer = container.querySelector('.overflow-auto');
    expect(scrollContainer).toBeTruthy();

    // Check for virtual item wrapper
    const virtualWrapper = container.querySelector('[style*="position: relative"]');
    expect(virtualWrapper).toBeTruthy();
  });

  it('should handle large number of nodes efficiently', () => {
    const { createNode } = useFolderTreeStore.getState();

    // Create many nodes
    for (let i = 0; i < 1000; i++) {
      createNode(null, 'request', `Request ${i}`);
    }

    const startTime = performance.now();
    const { container } = render(<VirtualizedFolderTree />);
    const renderTime = performance.now() - startTime;

    // Should render quickly even with many nodes
    expect(renderTime).toBeLessThan(100); // 100ms threshold
    expect(container.querySelector('[role="tree"]')).toBeTruthy();
  });

  it('should only render visible items', () => {
    const { createNode } = useFolderTreeStore.getState();

    // Create many nodes
    for (let i = 0; i < 100; i++) {
      createNode(null, 'request', `Request ${i}`);
    }

    const { container } = render(<VirtualizedFolderTree />);

    // Due to our mock, only 1 item should be rendered
    const treeItems = container.querySelectorAll('[role="treeitem"]');
    expect(treeItems).toHaveLength(1);
  });
});
