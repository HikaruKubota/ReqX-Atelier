import { create } from 'zustand';
import { TreeNode, TreeState, DropPosition } from '../types/tree';
import { v4 as uuidv4 } from 'uuid';

interface FolderTreeStore {
  // State
  treeState: TreeState;

  // Actions
  toggleNode: (nodeId: string) => void;
  selectNode: (nodeId: string, multi?: boolean) => void;
  focusNode: (nodeId: string) => void;
  startEditing: (nodeId: string) => void;
  endEditing: (nodeId: string, newName: string) => void;

  // Drag & Drop
  startDrag: (nodeId: string) => void;
  updateDropTarget: (targetId: string | null, position: DropPosition | null) => void;
  completeDrop: () => void;

  // CRUD Operations
  createNode: (parentId: string | null, type: 'folder' | 'request', name: string) => string;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, targetId: string, position: DropPosition) => void;

  // Navigation
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;

  // Search & Filter
  searchNodes: (query: string) => string[];
  filterByType: (type: 'folder' | 'request' | 'all') => void;
}

export const useFolderTreeStore = create<FolderTreeStore>((set, get) => ({
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

  toggleNode: (nodeId) => {
    set((state) => {
      const expandedIds = new Set(state.treeState.expandedIds);
      if (expandedIds.has(nodeId)) {
        expandedIds.delete(nodeId);
      } else {
        expandedIds.add(nodeId);
      }
      return {
        treeState: { ...state.treeState, expandedIds },
      };
    });
  },

  selectNode: (nodeId, multi = false) => {
    set((state) => {
      const selectedIds = new Set(state.treeState.selectedIds);

      if (multi) {
        if (selectedIds.has(nodeId)) {
          selectedIds.delete(nodeId);
        } else {
          selectedIds.add(nodeId);
        }
      } else {
        selectedIds.clear();
        selectedIds.add(nodeId);
      }

      return {
        treeState: { ...state.treeState, selectedIds },
      };
    });
  },

  focusNode: (nodeId) => {
    set((state) => ({
      treeState: { ...state.treeState, focusedId: nodeId },
    }));
  },

  startEditing: (nodeId) => {
    set((state) => ({
      treeState: { ...state.treeState, editingId: nodeId },
    }));
  },

  endEditing: (nodeId, newName) => {
    set((state) => {
      const nodes = new Map(state.treeState.nodes);
      const node = nodes.get(nodeId);

      if (node) {
        nodes.set(nodeId, { ...node, name: newName });
      }

      return {
        treeState: { ...state.treeState, nodes, editingId: null },
      };
    });
  },

  startDrag: (nodeId) => {
    set((state) => ({
      treeState: { ...state.treeState, draggedId: nodeId },
    }));
  },

  updateDropTarget: (targetId, position) => {
    set((state) => ({
      treeState: { ...state.treeState, dropTargetId: targetId, dropPosition: position },
    }));
  },

  completeDrop: () => {
    const { treeState } = get();
    const { draggedId, dropTargetId, dropPosition } = treeState;

    if (draggedId && dropTargetId && dropPosition) {
      const { moveNode } = get();
      moveNode(draggedId, dropTargetId, dropPosition);
    }

    set((state) => ({
      treeState: {
        ...state.treeState,
        draggedId: null,
        dropTargetId: null,
        dropPosition: null,
      },
    }));
  },

  createNode: (parentId, type, name) => {
    const newNodeId = uuidv4();
    const timestamp = Date.now();

    set((state) => {
      const nodes = new Map(state.treeState.nodes);
      const rootIds = [...state.treeState.rootIds];

      // Create the new node
      const newNode: TreeNode = {
        id: newNodeId,
        name,
        type,
        parentId,
        children: [],
        metadata: {
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      };

      nodes.set(newNodeId, newNode);

      // Update parent's children or add to root
      if (parentId) {
        const parent = nodes.get(parentId);
        if (parent) {
          nodes.set(parentId, {
            ...parent,
            children: [...parent.children, newNodeId],
          });
        }
      } else {
        rootIds.push(newNodeId);
      }

      return {
        treeState: { ...state.treeState, nodes, rootIds },
      };
    });

    return newNodeId;
  },

  deleteNode: (nodeId) => {
    set((state) => {
      const nodes = new Map(state.treeState.nodes);
      const rootIds = [...state.treeState.rootIds];
      const node = nodes.get(nodeId);

      if (!node) return state;

      // Recursively delete children
      const deleteRecursively = (id: string) => {
        const currentNode = nodes.get(id);
        if (currentNode) {
          currentNode.children.forEach(deleteRecursively);
          nodes.delete(id);
        }
      };

      deleteRecursively(nodeId);

      // Remove from parent's children or from root
      if (node.parentId) {
        const parent = nodes.get(node.parentId);
        if (parent) {
          nodes.set(node.parentId, {
            ...parent,
            children: parent.children.filter((id) => id !== nodeId),
          });
        }
      } else {
        const index = rootIds.indexOf(nodeId);
        if (index > -1) {
          rootIds.splice(index, 1);
        }
      }

      return {
        treeState: { ...state.treeState, nodes, rootIds },
      };
    });
  },

  moveNode: (nodeId: string, targetId: string, position: DropPosition) => {
    set((state) => {
      const nodes = new Map(state.treeState.nodes);
      const rootIds = [...state.treeState.rootIds];

      const node = nodes.get(nodeId);
      const targetNode = nodes.get(targetId);

      if (!node || !targetNode) return state;

      // Remove node from its current parent
      if (node.parentId) {
        const oldParent = nodes.get(node.parentId);
        if (oldParent) {
          nodes.set(node.parentId, {
            ...oldParent,
            children: oldParent.children.filter((id) => id !== nodeId),
          });
        }
      } else {
        const index = rootIds.indexOf(nodeId);
        if (index > -1) {
          rootIds.splice(index, 1);
        }
      }

      // Add node to new location
      if (position === 'inside' && targetNode.type === 'folder') {
        // Move inside folder
        nodes.set(nodeId, { ...node, parentId: targetId });
        nodes.set(targetId, {
          ...targetNode,
          children: [...targetNode.children, nodeId],
        });
      } else {
        // Move before or after
        const targetParentId = targetNode.parentId;
        nodes.set(nodeId, { ...node, parentId: targetParentId });

        if (targetParentId) {
          const targetParent = nodes.get(targetParentId);
          if (targetParent) {
            const targetIndex = targetParent.children.indexOf(targetId);
            const newChildren = [...targetParent.children];
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            newChildren.splice(insertIndex, 0, nodeId);

            nodes.set(targetParentId, {
              ...targetParent,
              children: newChildren,
            });
          }
        } else {
          const targetIndex = rootIds.indexOf(targetId);
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
          rootIds.splice(insertIndex, 0, nodeId);
        }
      }

      return {
        treeState: { ...state.treeState, nodes, rootIds },
      };
    });
  },

  navigateUp: () => {
    // Implementation will be added later
  },

  navigateDown: () => {
    // Implementation will be added later
  },

  navigateLeft: () => {
    // Implementation will be added later
  },

  navigateRight: () => {
    // Implementation will be added later
  },

  searchNodes: (query) => {
    const { nodes } = get().treeState;
    const results: string[] = [];

    nodes.forEach((node) => {
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(node.id);
      }
    });

    return results;
  },

  filterByType: () => {
    // Implementation will be added later
  },
}));
