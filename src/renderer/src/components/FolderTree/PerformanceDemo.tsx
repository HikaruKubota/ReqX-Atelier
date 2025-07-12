import React, { useEffect, useState } from 'react';
import { VirtualizedFolderTree } from './VirtualizedFolderTree';
import { FolderTree } from './index';
import { useFolderTreeStore } from '../../store/folderTreeStore';

export const PerformanceDemo: React.FC = () => {
  const { createNode, treeState } = useFolderTreeStore();
  const [useVirtualization, setUseVirtualization] = useState(true);
  const [nodeCount, setNodeCount] = useState(0);
  const [renderTime, setRenderTime] = useState<number | null>(null);

  // Generate test data
  const generateLargeTree = (folderCount: number, requestsPerFolder: number) => {
    const startTime = performance.now();

    // Clear existing nodes
    useFolderTreeStore.setState({
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
    });

    let totalNodes = 0;

    // Create root folders
    for (let i = 0; i < folderCount; i++) {
      const folderId = createNode(null, 'folder', `Folder ${i + 1}`);
      totalNodes++;

      // Create requests in each folder
      for (let j = 0; j < requestsPerFolder; j++) {
        createNode(folderId, 'request', `Request ${i + 1}-${j + 1}`);
        totalNodes++;
      }

      // Create some nested folders
      if (i % 3 === 0) {
        const nestedFolderId = createNode(folderId, 'folder', `Nested Folder ${i + 1}`);
        totalNodes++;

        // Add requests to nested folder
        for (let k = 0; k < 5; k++) {
          createNode(nestedFolderId, 'request', `Nested Request ${i + 1}-${k + 1}`);
          totalNodes++;
        }
      }
    }

    const endTime = performance.now();
    setNodeCount(totalNodes);
    setRenderTime(endTime - startTime);
  };

  // Generate initial test data
  useEffect(() => {
    generateLargeTree(100, 10);
  }, []);

  const handleOpenRequest = (nodeId: string) => {
    console.log('Opening request:', nodeId);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Folder Tree Performance Demo
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setUseVirtualization(!useVirtualization)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {useVirtualization ? 'Switch to Regular' : 'Switch to Virtualized'}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {useVirtualization ? 'Virtualized' : 'Regular'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => generateLargeTree(50, 10)}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            Generate 500+ nodes
          </button>
          <button
            onClick={() => generateLargeTree(100, 20)}
            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
          >
            Generate 2000+ nodes
          </button>
          <button
            onClick={() => generateLargeTree(200, 50)}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
          >
            Generate 10000+ nodes
          </button>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Nodes:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{nodeCount}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Generation Time:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {renderTime !== null ? `${renderTime.toFixed(2)}ms` : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Visible Nodes:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {treeState.rootIds.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {useVirtualization ? (
            <VirtualizedFolderTree onOpenRequest={handleOpenRequest} className="h-full" />
          ) : (
            <FolderTree onOpenRequest={handleOpenRequest} className="h-full" />
          )}
        </div>
      </div>
    </div>
  );
};
