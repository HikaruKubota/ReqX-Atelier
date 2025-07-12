import { useCallback, useState } from 'react';
import { useFolderTreeStore } from '../store/folderTreeStore';
import { DropPosition, TreeNode } from '../types/tree';

export function useTreeDragDrop() {
  const { treeState, startDrag, updateDropTarget, completeDrop } = useFolderTreeStore();
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', nodeId);
      startDrag(nodeId);

      // Create custom drag image
      const dragImage = document.createElement('div');
      dragImage.className = 'drag-ghost bg-blue-500 text-white px-2 py-1 rounded';
      const node = treeState.nodes.get(nodeId);
      dragImage.textContent = node?.name || '';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    },
    [startDrag, treeState.nodes],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      const node = treeState.nodes.get(nodeId);

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

      setDraggedOverId(nodeId);
      setDropPosition(position);
      updateDropTarget(nodeId, position);
    },
    [treeState.nodes, updateDropTarget],
  );

  const handleDragLeave = useCallback(() => {
    setDraggedOverId(null);
    setDropPosition(null);
    updateDropTarget(null, null);
  }, [updateDropTarget]);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain');

      if (sourceId && targetId && sourceId !== targetId) {
        // Check for circular reference
        if (!isDescendant(targetId, sourceId, treeState)) {
          // Implementation of actual move will be done in store
          completeDrop();
        }
      }

      setDraggedOverId(null);
      setDropPosition(null);
    },
    [treeState, completeDrop],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedOverId(null);
    setDropPosition(null);
    updateDropTarget(null, null);
  }, [updateDropTarget]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    draggedOverId,
    dropPosition,
  };
}

// Helper function to check if target is descendant of source
function isDescendant(
  targetId: string,
  sourceId: string,
  treeState: { nodes: Map<string, TreeNode> },
): boolean {
  const source = treeState.nodes.get(sourceId);
  if (!source || source.type !== 'folder') return false;

  const checkChildren = (nodeId: string): boolean => {
    const node = treeState.nodes.get(nodeId);
    if (!node) return false;

    if (node.id === targetId) return true;

    if (node.type === 'folder') {
      return node.children.some((childId) => checkChildren(childId));
    }

    return false;
  };

  return checkChildren(sourceId);
}
