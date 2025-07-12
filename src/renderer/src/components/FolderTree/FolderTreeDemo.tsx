import React, { useEffect } from 'react';
import { FolderTree } from './index';
import { useFolderTreeStore } from '../../store/folderTreeStore';

export const FolderTreeDemo: React.FC = () => {
  const { createNode } = useFolderTreeStore();

  useEffect(() => {
    // Create demo data
    const folder1 = createNode(null, 'folder', 'API Tests');
    const folder2 = createNode(null, 'folder', 'Authentication');

    // Add requests to folder1
    const req1 = createNode(folder1, 'request', 'Get Users');
    const req2 = createNode(folder1, 'request', 'Create User');
    const req3 = createNode(folder1, 'request', 'Update User');

    // Add requests to folder2
    const req4 = createNode(folder2, 'request', 'Login');
    const req5 = createNode(folder2, 'request', 'Logout');

    // Add a subfolder
    const subfolder = createNode(folder1, 'folder', 'Admin APIs');
    const req6 = createNode(subfolder, 'request', 'Delete User');

    // Update metadata for requests
    const { treeState } = useFolderTreeStore.getState();
    const nodes = new Map(treeState.nodes);

    // Add HTTP methods to requests
    const updateNodeMetadata = (nodeId: string, method: string) => {
      const node = nodes.get(nodeId);
      if (node) {
        nodes.set(nodeId, {
          ...node,
          metadata: {
            ...node.metadata!,
            method,
            url: `https://api.example.com/${node.name.toLowerCase().replace(/ /g, '-')}`,
          },
        });
      }
    };

    updateNodeMetadata(req1, 'GET');
    updateNodeMetadata(req2, 'POST');
    updateNodeMetadata(req3, 'PUT');
    updateNodeMetadata(req4, 'POST');
    updateNodeMetadata(req5, 'POST');
    updateNodeMetadata(req6, 'DELETE');

    useFolderTreeStore.setState({
      treeState: { ...treeState, nodes },
    });
  }, []);

  const handleOpenRequest = (nodeId: string) => {
    const node = useFolderTreeStore.getState().treeState.nodes.get(nodeId);
    console.log('Opening request:', node);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Folder Tree Demo
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <FolderTree onOpenRequest={handleOpenRequest} className="h-96" />
        </div>
      </div>
    </div>
  );
};
