/* eslint-disable react/prop-types */
import React, { useRef, useMemo, useCallback, useState } from 'react';
import { TreeNode } from './TreeNode';
import { useFolderTreeStore } from '../../store/folderTreeStore';
import { TreeNode as TreeNodeType } from '../../types/tree';
import { useTreeKeyboardNavigation } from '../../hooks/useTreeKeyboardNavigation';
import { useTreeDragDrop } from '../../hooks/useTreeDragDrop';
import { TreeContextMenu } from './TreeContextMenu';

interface FolderTreeProps {
  onOpenRequest?: (nodeId: string) => void;
  className?: string;
}

export const FolderTree: React.FC<FolderTreeProps> = React.memo(
  ({ onOpenRequest, className = '' }) => {
    const treeRef = useRef<HTMLDivElement>(null);
    const { handleShiftSelect } = useTreeKeyboardNavigation(treeRef, onOpenRequest);
    const {
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      draggedOverId,
      dropPosition,
    } = useTreeDragDrop();
    const { treeState, toggleNode, selectNode, focusNode, endEditing } = useFolderTreeStore();
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

    const handleNodeClick = (nodeId: string) => {
      const node = treeState.nodes.get(nodeId);
      if (node?.type === 'folder') {
        toggleNode(nodeId);
      } else if (node && onOpenRequest) {
        onOpenRequest(nodeId);
      }
    };

    const handleEndEdit = (nodeId: string, newName: string) => {
      if (newName.trim()) {
        endEditing(nodeId, newName.trim());
      } else {
        endEditing(nodeId, treeState.nodes.get(nodeId)?.name || '');
      }
      // Ensure focus returns to the tree after editing
      setTimeout(() => {
        if (treeRef.current) {
          treeRef.current.focus();
        }
      }, 0);
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

    return (
      <div
        ref={treeRef}
        role="tree"
        className={`folder-tree overflow-auto ${className}`}
        tabIndex={0}
        onBlur={(e) => {
          // Clear focus when the tree loses focus
          if (!e.currentTarget.contains(e.relatedTarget)) {
            focusNode('');
          }
        }}
      >
        {visibleNodes.map(({ node, level }) => (
          <TreeNode
            key={node.id}
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
            onSingleClick={() => handleNodeClick(node.id)}
            onDragStart={(e) => handleDragStart(e, node.id)}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, node.id)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
          />
        ))}
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
  },
);

FolderTree.displayName = 'FolderTree';

// Re-export virtualized version
export { VirtualizedFolderTree } from './VirtualizedFolderTree';
