import React, { useRef, useMemo, useCallback, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TreeNode } from './TreeNode';
import { useFolderTreeStore } from '../../store/folderTreeStore';
import { TreeNode as TreeNodeType } from '../../types/tree';
import { useTreeKeyboardNavigation } from '../../hooks/useTreeKeyboardNavigation';
import { useTreeDragDrop } from '../../hooks/useTreeDragDrop';
import { TreeContextMenu } from './TreeContextMenu';

interface VirtualizedFolderTreeProps {
  onOpenRequest?: (nodeId: string) => void;
  className?: string;
  itemHeight?: number;
}

export const VirtualizedFolderTree: React.FC<VirtualizedFolderTreeProps> = ({
  onOpenRequest,
  className = '',
  itemHeight = 28,
}) => {
  const treeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { handleShiftSelect } = useTreeKeyboardNavigation(treeRef);
  const {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    draggedOverId,
    dropPosition,
  } = useTreeDragDrop();
  const { treeState, toggleNode, selectNode, focusNode, startEditing, endEditing } =
    useFolderTreeStore();
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(
    null,
  );

  // Get visible nodes based on expanded state
  const visibleNodes = useMemo(() => {
    const nodes: { node: TreeNodeType; level: number }[] = [];

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

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleNodeToggle = (nodeId: string) => {
    toggleNode(nodeId);
  };

  const handleNodeSelect = useCallback(
    (nodeId: string, event?: React.MouseEvent) => {
      if (event?.shiftKey) {
        handleShiftSelect(nodeId);
      } else if (event?.ctrlKey || event?.metaKey) {
        selectNode(nodeId, true);
      } else {
        selectNode(nodeId);
      }
      focusNode(nodeId);
    },
    [selectNode, focusNode, handleShiftSelect],
  );

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = treeState.nodes.get(nodeId);
    if (node?.type === 'folder') {
      toggleNode(nodeId);
    } else if (node && onOpenRequest) {
      onOpenRequest(nodeId);
    } else if (node) {
      startEditing(nodeId);
    }
  };

  const handleEndEdit = (nodeId: string, newName: string) => {
    if (newName.trim()) {
      endEditing(nodeId, newName.trim());
    } else {
      endEditing(nodeId, treeState.nodes.get(nodeId)?.name || '');
    }
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      // Select the node if it's not already selected
      if (!treeState.selectedIds.has(nodeId)) {
        selectNode(nodeId);
        focusNode(nodeId);
      }
      setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
    },
    [treeState.selectedIds, selectNode, focusNode],
  );

  // Scroll to focused node when it changes
  React.useEffect(() => {
    if (treeState.focusedId) {
      const index = visibleNodes.findIndex((item) => item.node.id === treeState.focusedId);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'auto' });
      }
    }
  }, [treeState.focusedId, visibleNodes, virtualizer]);

  return (
    <div ref={treeRef} className={`folder-tree ${className}`}>
      <div
        ref={scrollContainerRef}
        role="tree"
        className="h-full overflow-auto"
        tabIndex={0}
        style={{
          height: '100%',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const { node, level } = visibleNodes[virtualItem.index];
            return (
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
                <TreeNode
                  node={node}
                  level={level}
                  isExpanded={treeState.expandedIds.has(node.id)}
                  isSelected={treeState.selectedIds.has(node.id)}
                  isFocused={treeState.focusedId === node.id}
                  isEditing={treeState.editingId === node.id}
                  isDragging={treeState.draggedId === node.id}
                  isDraggedOver={draggedOverId === node.id}
                  dropPosition={draggedOverId === node.id ? dropPosition : null}
                  onToggle={() => handleNodeToggle(node.id)}
                  onSelect={(event) => handleNodeSelect(node.id, event)}
                  onEndEdit={(newName) => handleEndEdit(node.id, newName)}
                  onDoubleClick={() => handleNodeDoubleClick(node.id)}
                  onDragStart={(e) => handleDragStart(e, node.id)}
                  onDragOver={(e) => handleDragOver(e, node.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, node.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, node.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
      {contextMenu && (
        <TreeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
