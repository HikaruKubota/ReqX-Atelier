import { useEffect, useCallback } from 'react';
import { useFolderTreeStore } from '../store/folderTreeStore';
import { TreeNode } from '../types/tree';

export function useTreeKeyboardNavigation(treeRef: React.RefObject<HTMLDivElement | null>) {
  const { treeState, toggleNode, selectNode, focusNode, startEditing, deleteNode } =
    useFolderTreeStore();

  // Get all visible nodes in order
  const getVisibleNodes = useCallback((): { node: TreeNode; level: number }[] => {
    const nodes: { node: TreeNode; level: number }[] = [];

    const addVisibleNodes = (nodeIds: string[], level = 0) => {
      nodeIds.forEach((nodeId) => {
        const node = treeState.nodes.get(nodeId);
        if (!node) return;

        nodes.push({ node, level });

        if (node.type === 'folder' && treeState.expandedIds.has(node.id)) {
          addVisibleNodes(node.children, level + 1);
        }
      });
    };

    addVisibleNodes(treeState.rootIds);
    return nodes;
  }, [treeState.nodes, treeState.expandedIds, treeState.rootIds]);

  // Navigate to the previous node
  const navigateUp = useCallback(() => {
    const visibleNodes = getVisibleNodes();
    const currentIndex = visibleNodes.findIndex(({ node }) => node.id === treeState.focusedId);

    if (currentIndex > 0) {
      const prevNode = visibleNodes[currentIndex - 1];
      focusNode(prevNode.node.id);
      selectNode(prevNode.node.id);
    }
  }, [getVisibleNodes, treeState.focusedId, focusNode, selectNode]);

  // Navigate to the next node
  const navigateDown = useCallback(() => {
    const visibleNodes = getVisibleNodes();
    const currentIndex = visibleNodes.findIndex(({ node }) => node.id === treeState.focusedId);

    if (currentIndex < visibleNodes.length - 1) {
      const nextNode = visibleNodes[currentIndex + 1];
      focusNode(nextNode.node.id);
      selectNode(nextNode.node.id);
    }
  }, [getVisibleNodes, treeState.focusedId, focusNode, selectNode]);

  // Navigate left (collapse folder or go to parent)
  const navigateLeft = useCallback(() => {
    const node = treeState.nodes.get(treeState.focusedId || '');
    if (!node) return;

    if (node.type === 'folder' && treeState.expandedIds.has(node.id)) {
      toggleNode(node.id);
    } else if (node.parentId) {
      focusNode(node.parentId);
      selectNode(node.parentId);
    }
  }, [
    treeState.nodes,
    treeState.focusedId,
    treeState.expandedIds,
    toggleNode,
    focusNode,
    selectNode,
  ]);

  // Navigate right (expand folder or go to first child)
  const navigateRight = useCallback(() => {
    const node = treeState.nodes.get(treeState.focusedId || '');
    if (!node) return;

    if (node.type === 'folder') {
      if (!treeState.expandedIds.has(node.id)) {
        toggleNode(node.id);
      } else if (node.children.length > 0) {
        focusNode(node.children[0]);
        selectNode(node.children[0]);
      }
    }
  }, [
    treeState.nodes,
    treeState.focusedId,
    treeState.expandedIds,
    toggleNode,
    focusNode,
    selectNode,
  ]);

  // Handle multiple selection with Shift key
  const handleShiftSelect = useCallback(
    (targetId: string) => {
      const visibleNodes = getVisibleNodes();
      const lastSelectedId = Array.from(treeState.selectedIds).pop();

      if (!lastSelectedId) {
        selectNode(targetId);
        return;
      }

      const startIndex = visibleNodes.findIndex(({ node }) => node.id === lastSelectedId);
      const endIndex = visibleNodes.findIndex(({ node }) => node.id === targetId);

      if (startIndex === -1 || endIndex === -1) {
        selectNode(targetId);
        return;
      }

      const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      // Clear selection and select range
      useFolderTreeStore.setState((state) => ({
        treeState: {
          ...state.treeState,
          selectedIds: new Set(visibleNodes.slice(from, to + 1).map(({ node }) => node.id)),
        },
      }));
    },
    [getVisibleNodes, treeState.selectedIds, selectNode],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!treeRef.current?.contains(e.target as Node)) return;

      // Don't handle keys when editing
      if (treeState.editingId) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;

        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          navigateLeft();
          break;

        case 'ArrowRight':
          e.preventDefault();
          navigateRight();
          break;

        case 'Enter':
          e.preventDefault();
          if (treeState.focusedId) {
            const node = treeState.nodes.get(treeState.focusedId);
            if (node?.type === 'folder') {
              toggleNode(node.id);
            }
          }
          break;

        case 'F2':
          e.preventDefault();
          if (treeState.focusedId) {
            startEditing(treeState.focusedId);
          }
          break;

        case 'Delete':
          e.preventDefault();
          if (treeState.selectedIds.size > 0) {
            // Delete all selected nodes
            Array.from(treeState.selectedIds).forEach((nodeId) => {
              deleteNode(nodeId);
            });
          }
          break;

        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Select all visible nodes
            const visibleNodes = getVisibleNodes();
            useFolderTreeStore.setState((state) => ({
              treeState: {
                ...state.treeState,
                selectedIds: new Set(visibleNodes.map(({ node }) => node.id)),
              },
            }));
          }
          break;

        case 'Home': {
          e.preventDefault();
          const visibleNodes = getVisibleNodes();
          if (visibleNodes.length > 0) {
            const firstNode = visibleNodes[0];
            focusNode(firstNode.node.id);
            selectNode(firstNode.node.id);
          }
          break;
        }

        case 'End': {
          e.preventDefault();
          const nodes = getVisibleNodes();
          if (nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            focusNode(lastNode.node.id);
            selectNode(lastNode.node.id);
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    treeRef,
    treeState,
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight,
    toggleNode,
    startEditing,
    deleteNode,
    getVisibleNodes,
    focusNode,
    selectNode,
  ]);

  return {
    handleShiftSelect,
  };
}
