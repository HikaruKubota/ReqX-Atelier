# フォルダ機能 技術実装詳細

## 1. コンポーネントアーキテクチャ

### 1.1 コンポーネント構成

```typescript
// src/renderer/src/components/FolderTree/index.tsx
interface FolderTreeProps {
  nodes: TreeNode[];
  onSelect?: (nodeId: string) => void;
  onOpen?: (nodeId: string) => void;
  onContextMenu?: (nodeId: string, event: React.MouseEvent) => void;
  onMove?: (sourceId: string, targetId: string, position: DropPosition) => void;
  className?: string;
}

// src/renderer/src/components/FolderTree/TreeNode.tsx
interface TreeNodeProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onStartEdit: () => void;
  onEndEdit: (newName: string) => void;
}
```

### 1.2 データ構造

```typescript
// src/renderer/src/types/tree.ts
export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'request';
  parentId: string | null;
  children: string[];
  metadata?: {
    method?: HttpMethod;
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
```

## 2. 状態管理実装

### 2.1 Zustand Store設計

```typescript
// src/renderer/src/store/folderTreeStore.ts
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
  moveNode: (nodeId: string, newParentId: string | null, position: number) => void;
  
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
        treeState: { ...state.treeState, expandedIds }
      };
    });
  },
  
  // ... その他のアクション実装
}));
```

## 3. キーボードナビゲーション実装

### 3.1 キーボードハンドラー

```typescript
// src/renderer/src/hooks/useTreeKeyboardNavigation.ts
export function useTreeKeyboardNavigation(treeRef: React.RefObject<HTMLDivElement>) {
  const { treeState, navigateUp, navigateDown, navigateLeft, navigateRight, toggleNode, startEditing } = useFolderTreeStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!treeRef.current?.contains(e.target as Node)) return;
      
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
          if (treeState.focusedId) {
            const node = treeState.nodes.get(treeState.focusedId);
            if (node?.type === 'folder' && treeState.expandedIds.has(node.id)) {
              toggleNode(node.id);
            } else {
              navigateLeft();
            }
          }
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          if (treeState.focusedId) {
            const node = treeState.nodes.get(treeState.focusedId);
            if (node?.type === 'folder' && !treeState.expandedIds.has(node.id)) {
              toggleNode(node.id);
            } else {
              navigateRight();
            }
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (treeState.focusedId) {
            const node = treeState.nodes.get(treeState.focusedId);
            if (node?.type === 'folder') {
              toggleNode(node.id);
            } else {
              // Open request
              onOpenRequest(node.id);
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
            // Delete selected nodes
            handleDeleteNodes();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [treeState, navigateUp, navigateDown, navigateLeft, navigateRight, toggleNode, startEditing]);
}
```

## 4. ドラッグ&ドロップ実装

### 4.1 ドラッグハンドラー

```typescript
// src/renderer/src/hooks/useTreeDragDrop.ts
export function useTreeDragDrop() {
  const { startDrag, updateDropTarget, completeDrop, moveNode } = useFolderTreeStore();
  
  const handleDragStart = useCallback((e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
    startDrag(nodeId);
    
    // ドラッグゴーストのカスタマイズ
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.textContent = getNodeName(nodeId);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [startDrag]);
  
  const handleDragOver = useCallback((e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const node = getNode(nodeId);
    
    let position: DropPosition;
    if (node?.type === 'folder') {
      if (y < height * 0.25) {
        position = 'before';
      } else if (y > height * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
    } else {
      position = y < height * 0.5 ? 'before' : 'after';
    }
    
    updateDropTarget(nodeId, position);
  }, [updateDropTarget]);
  
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId && targetId && sourceId !== targetId) {
      // 循環参照チェック
      if (!isDescendant(targetId, sourceId)) {
        completeDrop();
      }
    }
  }, [completeDrop]);
  
  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
```

## 5. 仮想スクロール実装

### 5.1 仮想リスト実装 (react-window使用)

```typescript
// src/renderer/src/components/FolderTree/VirtualTree.tsx
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualTreeProps {
  nodes: TreeNode[];
  itemHeight?: number;
}

export function VirtualTree({ nodes, itemHeight = 28 }: VirtualTreeProps) {
  // ツリー構造をフラット化して表示用リストを作成
  const flatNodes = useMemo(() => {
    return flattenTreeWithMetadata(nodes);
  }, [nodes]);

  // 各アイテムのレンダリング
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const node = flatNodes[index];
    return (
      <div style={style}>
        <TreeNode
          node={node}
          level={node.level}
          // その他のprops
        />
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={flatNodes.length}
          itemSize={itemHeight}
          width={width}
          overscanCount={5}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}

// 代替実装: @tanstack/react-virtual 使用例
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualTreeTanstack({ nodes }: VirtualTreeProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const flatNodes = useMemo(() => flattenTreeWithMetadata(nodes), [nodes]);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="virtual-tree-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TreeNode node={flatNodes[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 6. パフォーマンス最適化

### 6.1 メモ化戦略

```typescript
// src/renderer/src/components/FolderTree/optimizations.ts

// ノードコンポーネントのメモ化
export const MemoizedTreeNode = React.memo<TreeNodeProps>(
  TreeNode,
  (prevProps, nextProps) => {
    // 必要なプロパティのみを比較
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.node.name === nextProps.node.name &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isFocused === nextProps.isFocused &&
      prevProps.isEditing === nextProps.isEditing
    );
  }
);

// 高価な計算のメモ化
export const useVisibleNodes = (nodes: Map<string, TreeNode>, expandedIds: Set<string>) => {
  return useMemo(() => {
    const visibleNodes: TreeNode[] = [];
    
    const addVisibleNodes = (nodeIds: string[], level = 0) => {
      nodeIds.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (!node) return;
        
        visibleNodes.push({ ...node, level });
        
        if (node.type === 'folder' && expandedIds.has(node.id)) {
          addVisibleNodes(node.children, level + 1);
        }
      });
    };
    
    const rootIds = Array.from(nodes.values())
      .filter(node => !node.parentId)
      .map(node => node.id);
    
    addVisibleNodes(rootIds);
    return visibleNodes;
  }, [nodes, expandedIds]);
};
```

## 7. アクセシビリティ実装

### 7.1 ARIA属性とロール

```typescript
// src/renderer/src/components/FolderTree/TreeNode.tsx
export function TreeNode({ node, level, isExpanded, isSelected, isFocused }: TreeNodeProps) {
  return (
    <div
      role="treeitem"
      aria-expanded={node.type === 'folder' ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={level + 1}
      aria-setsize={getSiblingCount(node)}
      aria-posinset={getPositionInSet(node)}
      tabIndex={isFocused ? 0 : -1}
      className={classNames(
        'tree-node',
        { 'tree-node--selected': isSelected },
        { 'tree-node--focused': isFocused }
      )}
    >
      <span className="tree-node__indent" style={{ width: level * 20 }} />
      {node.type === 'folder' && (
        <button
          className="tree-node__toggle"
          aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          onClick={handleToggle}
        >
          <ChevronIcon direction={isExpanded ? 'down' : 'right'} />
        </button>
      )}
      <Icon type={node.type} method={node.metadata?.method} />
      <span className="tree-node__name">{node.name}</span>
    </div>
  );
}
```

## 8. スタイリング実装

### 8.1 CSS変数によるテーマ対応

```css
/* src/renderer/src/components/FolderTree/styles.css */
.folder-tree {
  --tree-indent-width: 20px;
  --tree-item-height: 28px;
  --tree-hover-bg: var(--color-hover);
  --tree-selected-bg: var(--color-selected);
  --tree-focused-border: var(--color-primary);
  --tree-drag-over-bg: var(--color-primary-alpha);
}

.tree-node {
  height: var(--tree-item-height);
  display: flex;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s ease;
}

.tree-node:hover {
  background-color: var(--tree-hover-bg);
}

.tree-node--selected {
  background-color: var(--tree-selected-bg);
}

.tree-node--focused {
  outline: 2px solid var(--tree-focused-border);
  outline-offset: -2px;
}

.tree-node--drop-target-before {
  border-top: 2px solid var(--tree-drag-over-bg);
}

.tree-node--drop-target-inside {
  background-color: var(--tree-drag-over-bg);
}

.tree-node--drop-target-after {
  border-bottom: 2px solid var(--tree-drag-over-bg);
}

/* アニメーション */
.tree-node__toggle {
  transition: transform 0.2s ease;
}

.tree-node__toggle--expanded {
  transform: rotate(90deg);
}

/* インライン編集 */
.tree-node__edit-input {
  flex: 1;
  margin: 0 4px;
  padding: 2px 4px;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  font-size: inherit;
  font-family: inherit;
}
```

## 9. テスト実装例

### 9.1 ユニットテスト

```typescript
// src/renderer/src/components/FolderTree/__tests__/FolderTree.test.tsx
describe('FolderTree', () => {
  it('should render tree structure correctly', () => {
    const nodes = createMockNodes();
    const { container } = render(<FolderTree nodes={nodes} />);
    
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(5);
    expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
  });
  
  it('should handle keyboard navigation', async () => {
    const nodes = createMockNodes();
    const { container } = render(<FolderTree nodes={nodes} />);
    
    const tree = container.querySelector('[role="tree"]');
    tree?.focus();
    
    // Navigate down
    fireEvent.keyDown(tree!, { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('aria-level')).toBe('1');
    
    // Expand folder
    fireEvent.keyDown(tree!, { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('aria-expanded')).toBe('true');
  });
  
  it('should handle drag and drop', async () => {
    const onMove = jest.fn();
    const nodes = createMockNodes();
    const { container } = render(<FolderTree nodes={nodes} onMove={onMove} />);
    
    const sourceNode = container.querySelector('[data-node-id="node1"]');
    const targetNode = container.querySelector('[data-node-id="node2"]');
    
    fireEvent.dragStart(sourceNode!, { dataTransfer: { setData: jest.fn() } });
    fireEvent.dragOver(targetNode!, { clientY: 50 });
    fireEvent.drop(targetNode!);
    
    expect(onMove).toHaveBeenCalledWith('node1', 'node2', 'inside');
  });
});
```

## 10. 移行用互換レイヤー

### 10.1 既存APIとの互換性維持

```typescript
// src/renderer/src/components/FolderTree/compat.ts

// 既存のreact-arborist APIをエミュレート
export function useArboristCompat(treeRef: React.RefObject<FolderTreeHandle>) {
  return {
    tree: {
      scrollTo: (nodeId: string) => {
        treeRef.current?.scrollToNode(nodeId);
      },
      focus: () => {
        treeRef.current?.focus();
      },
      edit: (nodeId: string) => {
        treeRef.current?.startEditing(nodeId);
      },
    },
  };
}

// 既存データ構造の変換
export function convertLegacyData(legacyData: LegacyTreeData): TreeNode[] {
  return legacyData.items.map(item => ({
    id: item.id,
    name: item.data.name,
    type: item.children ? 'folder' : 'request',
    parentId: item.parent?.id || null,
    children: item.children?.map(c => c.id) || [],
    metadata: item.data.metadata,
  }));
}
```

これらの技術詳細により、VSCodeライクな高性能でユーザーフレンドリーなフォルダ機能を実現できます。