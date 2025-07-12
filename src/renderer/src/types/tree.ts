export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'request';
  parentId: string | null;
  children: string[];
  metadata?: {
    method?: string;
    url?: string;
    createdAt: number;
    updatedAt: number;
  };
}

export interface TreeState {
  nodes: Map<string, TreeNode>;
  rootIds: string[];
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  focusedId: string | null;
  editingId: string | null;
  draggedId: string | null;
  dropTargetId: string | null;
  dropPosition: DropPosition | null;
}

export type DropPosition = 'before' | 'inside' | 'after';
