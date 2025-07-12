import React, { useEffect } from 'react';
import { FolderTreeAdapter } from './FolderTreeAdapter';
import { useSavedRequestsStore } from '../../store/savedRequestsStore';
import type { SavedRequest } from '../../types';

export const AdapterDemo: React.FC = () => {
  const { addFolder, addRequest, savedFolders, savedRequests } = useSavedRequestsStore();

  // Create demo data if none exists
  useEffect(() => {
    if (savedFolders.length === 0 && savedRequests.length === 0) {
      // Create sample folders
      const apiFolder = addFolder({
        name: 'API Tests',
        parentFolderId: null,
        requestIds: [],
        subFolderIds: [],
      });
      const authFolder = addFolder({
        name: 'Authentication',
        parentFolderId: apiFolder,
        requestIds: [],
        subFolderIds: [],
      });
      const usersFolder = addFolder({
        name: 'Users',
        parentFolderId: apiFolder,
        requestIds: [],
        subFolderIds: [],
      });

      // Create sample requests
      const loginId = addRequest({
        name: 'Login',
        method: 'POST',
        url: 'https://api.example.com/auth/login',
        headers: [],
        body: [],
        params: [],
      });

      const refreshId = addRequest({
        name: 'Refresh Token',
        method: 'POST',
        url: 'https://api.example.com/auth/refresh',
        headers: [],
        body: [],
        params: [],
      });

      const getUsersId = addRequest({
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: [],
        body: [],
        params: [],
      });

      const createUserId = addRequest({
        name: 'Create User',
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: [],
        body: [],
        params: [],
      });

      // Create a root-level request
      addRequest({
        name: 'Health Check',
        method: 'GET',
        url: 'https://api.example.com/health',
        headers: [],
        body: [],
        params: [],
      });

      // Update folders with request IDs
      useSavedRequestsStore.getState().updateFolder(authFolder, {
        requestIds: [loginId, refreshId],
      });
      useSavedRequestsStore.getState().updateFolder(usersFolder, {
        requestIds: [getUsersId, createUserId],
      });
      useSavedRequestsStore.getState().updateFolder(apiFolder, {
        subFolderIds: [authFolder, usersFolder],
      });
    }
  }, [savedFolders.length, savedRequests.length, addFolder, addRequest]);

  const handleOpenRequest = (request: SavedRequest) => {
    console.log('Opening request:', request);
    alert(`Opening request: ${request.name} - ${request.method} ${request.url}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Folder Tree Adapter Demo
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This demo shows the new folder tree integrated with the existing savedRequestsStore. The
          tree will sync with your saved requests and folders.
        </p>

        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Folders:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {savedFolders.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Requests:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {savedRequests.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4">
          <FolderTreeAdapter
            onOpenRequest={handleOpenRequest}
            className="h-full"
            useVirtualization={false}
          />
        </div>
      </div>
    </div>
  );
};
