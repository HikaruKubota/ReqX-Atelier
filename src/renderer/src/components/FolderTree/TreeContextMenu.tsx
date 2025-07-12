import React from 'react';
import { ContextMenu } from '../atoms/menu/ContextMenu';
import { useFolderTreeStore } from '../../store/folderTreeStore';

interface TreeContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export const TreeContextMenu: React.FC<TreeContextMenuProps> = ({ nodeId, x, y, onClose }) => {
  const { treeState, createNode, deleteNode, startEditing } = useFolderTreeStore();
  const node = treeState.nodes.get(nodeId);

  if (!node) return null;

  const handleNewFolder = () => {
    const newFolderId = createNode(
      node.type === 'folder' ? nodeId : node.parentId,
      'folder',
      'New Folder',
    );
    startEditing(newFolderId);
    onClose();
  };

  const handleNewRequest = () => {
    const newRequestId = createNode(
      node.type === 'folder' ? nodeId : node.parentId,
      'request',
      'New Request',
    );
    startEditing(newRequestId);
    onClose();
  };

  const handleRename = () => {
    startEditing(nodeId);
    onClose();
  };

  const handleDelete = () => {
    if (treeState.selectedIds.size > 1) {
      // Delete all selected items
      Array.from(treeState.selectedIds).forEach((id) => {
        deleteNode(id);
      });
    } else {
      deleteNode(nodeId);
    }
    onClose();
  };

  const menuItems = [];

  if (node.type === 'folder') {
    menuItems.push(
      { label: 'New Folder', onClick: handleNewFolder },
      { label: 'New Request', onClick: handleNewRequest },
    );
  }

  menuItems.push(
    { label: 'Rename', onClick: handleRename },
    { label: 'Delete', onClick: handleDelete },
  );

  return <ContextMenu position={{ x, y }} items={menuItems} onClose={onClose} />;
};
