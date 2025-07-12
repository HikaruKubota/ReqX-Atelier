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
  createNode: (
    parentId: string | null,
    type: 'folder' | 'request',
    name: string,
    autoExpand?: boolean,
  ) => string;
  updateNode: (nodeId: string, updates: Partial<TreeNode>) => void;
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

  // Sorting
  sortChildren: (nodeId: string | null) => void;
  sortChildrenArray: (children: string[], nodes: Map<string, TreeNode>) => string[];
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
      const rootIds = [...state.treeState.rootIds];
      const node = nodes.get(nodeId);

      if (node) {
        const oldName = node.name;
        nodes.set(nodeId, { ...node, name: newName });

        // Re-sort if name changed
        if (oldName !== newName) {
          if (node.parentId) {
            const parent = nodes.get(node.parentId);
            if (parent) {
              const sortedChildren = get().sortChildrenArray(parent.children, nodes);
              nodes.set(node.parentId, {
                ...parent,
                children: sortedChildren,
              });
            }
          } else {
            // Re-sort root level
            const sortedRootIds = get().sortChildrenArray(rootIds, nodes);
            rootIds.length = 0;
            rootIds.push(...sortedRootIds);
          }
        }
      }

      return {
        treeState: {
          ...state.treeState,
          nodes,
          rootIds,
          editingId: null,
          // Maintain focus on the edited node
          focusedId: nodeId,
        },
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

  createNode: (parentId, type, name, autoExpand = true) => {
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
      let expandedIds = state.treeState.expandedIds;

      if (parentId) {
        const parent = nodes.get(parentId);
        if (parent) {
          const newChildren = [...parent.children, newNodeId];
          // Sort children after adding new node
          const sortedChildren = get().sortChildrenArray(newChildren, nodes);
          nodes.set(parentId, {
            ...parent,
            children: sortedChildren,
          });

          // Auto-expand parent folder when adding new items (if autoExpand is enabled)
          if (autoExpand) {
            expandedIds = new Set([...expandedIds, parentId]);
          }
        }
      } else {
        rootIds.push(newNodeId);
        // Sort root nodes
        const sortedRootIds = get().sortChildrenArray(rootIds, nodes);
        rootIds.length = 0;
        rootIds.push(...sortedRootIds);
      }

      return {
        treeState: { ...state.treeState, nodes, rootIds, expandedIds },
      };
    });

    return newNodeId;
  },

  updateNode: (nodeId, updates) => {
    set((state) => {
      const nodes = new Map(state.treeState.nodes);
      const node = nodes.get(nodeId);

      if (!node) return state;

      nodes.set(nodeId, {
        ...node,
        ...updates,
        id: node.id, // Ensure ID cannot be changed
      });

      return {
        treeState: { ...state.treeState, nodes },
      };
    });
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
        const newChildren = [...targetNode.children, nodeId];
        // Sort the children after adding the node
        const sortedChildren = get().sortChildrenArray(newChildren, nodes);
        nodes.set(targetId, {
          ...targetNode,
          children: sortedChildren,
        });
      } else {
        // Move before or after (but we'll sort anyway, so just add to the parent)
        const targetParentId = targetNode.parentId;
        nodes.set(nodeId, { ...node, parentId: targetParentId });

        if (targetParentId) {
          const targetParent = nodes.get(targetParentId);
          if (targetParent) {
            const newChildren = [...targetParent.children, nodeId];
            // Sort the children after adding the node
            const sortedChildren = get().sortChildrenArray(newChildren, nodes);
            nodes.set(targetParentId, {
              ...targetParent,
              children: sortedChildren,
            });
          }
        } else {
          // Add to root and sort
          rootIds.push(nodeId);
          const sortedRootIds = get().sortChildrenArray(rootIds, nodes);
          rootIds.length = 0;
          rootIds.push(...sortedRootIds);
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

  sortChildrenArray: (children, nodes) => {
    return [...children].sort((a, b) => {
      const nodeA = nodes.get(a);
      const nodeB = nodes.get(b);

      if (!nodeA || !nodeB) return 0;

      // Folders first, then requests
      if (nodeA.type !== nodeB.type) {
        return nodeA.type === 'folder' ? -1 : 1;
      }

      // Then sort by name (case-insensitive)
      return nodeA.name.toLowerCase().localeCompare(nodeB.name.toLowerCase());
    });
  },

  sortChildren: (nodeId) => {
    set((state) => {
      const nodes = new Map(state.treeState.nodes);
      const rootIds = [...state.treeState.rootIds];

      if (nodeId === null) {
        // Sort root nodes
        const sortedRootIds = get().sortChildrenArray(rootIds, nodes);
        return {
          treeState: { ...state.treeState, rootIds: sortedRootIds },
        };
      } else {
        // Sort children of specific node
        const node = nodes.get(nodeId);
        if (node) {
          const sortedChildren = get().sortChildrenArray(node.children, nodes);
          nodes.set(nodeId, {
            ...node,
            children: sortedChildren,
          });
        }
        return {
          treeState: { ...state.treeState, nodes },
        };
      }
    });
  },
}));
