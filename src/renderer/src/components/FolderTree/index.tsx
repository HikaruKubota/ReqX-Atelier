import React, { useRef, useMemo } from 'react';
import { TreeNode } from './TreeNode';
import { useFolderTreeStore } from '../../store/folderTreeStore';
import { TreeNode as TreeNodeType } from '../../types/tree';

interface FolderTreeProps {
  onOpenRequest?: (nodeId: string) => void;
  className?: string;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ onOpenRequest, className = '' }) => {
  const treeRef = useRef<HTMLDivElement>(null);
  const { treeState, toggleNode, selectNode, focusNode, startEditing, endEditing } =
    useFolderTreeStore();

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

  const handleNodeSelect = (nodeId: string) => {
    selectNode(nodeId);
    focusNode(nodeId);
  };

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

  return (
    <div
      ref={treeRef}
      role="tree"
      className={`folder-tree overflow-auto ${className}`}
      tabIndex={0}
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
          onToggle={() => handleNodeToggle(node.id)}
          onSelect={() => handleNodeSelect(node.id)}
          onEndEdit={(newName) => handleEndEdit(node.id, newName)}
          onDoubleClick={() => handleNodeDoubleClick(node.id)}
        />
      ))}
    </div>
  );
};
