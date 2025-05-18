import { useState, useEffect, useCallback } from 'react';
import type { KeyValuePair, SavedRequest, RequestFolder } from '../types';


const LOCAL_STORAGE_KEY = 'reqx_saved_requests';

export const useSavedRequests = () => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [folders, setFolders] = useState<RequestFolder[]>([]);

  // Load saved requests from localStorage on initial mount
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const loadedRequests: Array<Partial<SavedRequest> & { body?: string }> =
          Array.isArray(parsed.requests) || Array.isArray(parsed)
            ? (Array.isArray(parsed) ? parsed : parsed.requests)
            : [];
        const loadedFolders: RequestFolder[] =
          Array.isArray(parsed.folders) ? parsed.folders : [];

        const requestsWithIds = loadedRequests.map((req) => {
          let bodyKeyValuePairs: KeyValuePair[] | undefined = req.bodyKeyValuePairs;
          // Migration logic for old 'body' string
          if (req.body && !req.bodyKeyValuePairs) {
            try {
              const parsedJsonBody = JSON.parse(req.body);
              if (
                typeof parsedJsonBody === 'object' &&
                parsedJsonBody !== null &&
                !Array.isArray(parsedJsonBody)
              ) {
                bodyKeyValuePairs = Object.entries(parsedJsonBody).map(([k, v], index) => ({
                  id: `kv-migrated-${k}-${index}-${Date.now()}`,
                  keyName: k,
                  value: typeof v === 'string' ? v : JSON.stringify(v, null, 2),
                  enabled: true, // Assume migrated K-V pairs are enabled
                }));
              }
            } catch (e) {
              console.warn(
                "Failed to migrate 'body' string to key-value pairs for request:",
                req.name,
                e,
              );
              // If parsing fails, keep bodyKeyValuePairs as undefined or empty
              bodyKeyValuePairs = [];
            }
          }

          return {
            ...req,
            id: req.id || `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: req.name || 'Untitled Request',
            method: req.method || 'GET',
            url: req.url || '',
            headers: req.headers || [],
            bodyKeyValuePairs: bodyKeyValuePairs || [], // Ensure bodyKeyValuePairs array exists
            body: undefined, // Remove the old body property explicitly
          };
        }) as SavedRequest[];
        setSavedRequests(requestsWithIds);
        setFolders(loadedFolders);
      } catch (error) {
        console.error('Failed to parse saved requests from localStorage:', error);
        setSavedRequests([]); // Fallback to empty array on error
        setFolders([]);
      }
    }
  }, []);

  // Save requests and folders to localStorage whenever they change
  useEffect(() => {
    const requestsToSave = savedRequests.map((req) => {
      const { ...rest } = req as SavedRequest & { body?: string };
      return rest;
    });
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ folders, requests: requestsToSave })
    );
  }, [savedRequests, folders]);

  const addRequest = useCallback(
    (
      request: Omit<SavedRequest, 'id' | 'bodyKeyValuePairs'> & {
        bodyKeyValuePairs?: KeyValuePair[];
      },
    ): string => {
      const newId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newRequest = {
        ...request,
        id: newId,
        folderId: request.folderId,
        headers: request.headers || [],
        bodyKeyValuePairs: request.bodyKeyValuePairs || [],
      };
      setSavedRequests((prevRequests) => [...prevRequests, newRequest]);
      return newId;
    },
    [],
  );

  const updateRequest = useCallback(
    (id: string, updatedFields: Partial<Omit<SavedRequest, 'id'>>) => {
      setSavedRequests((prevRequests) =>
        prevRequests.map((req) => (req.id === id ? { ...req, ...updatedFields } : req)),
      );
    },
    [],
  );

  const deleteRequest = useCallback((id: string) => {
    setSavedRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
  }, []);

  const addFolder = useCallback((name: string): string => {
    const id = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const folder = { id, name };
    setFolders((prev) => [...prev, folder]);
    return id;
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setSavedRequests((prev) => prev.map((r) => (r.folderId === id ? { ...r, folderId: undefined } : r)));
  }, []);

  const moveRequest = useCallback((reqId: string, folderId?: string) => {
    setSavedRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, folderId } : r)));
  }, []);

  return {
    savedRequests,
    folders,
    addRequest,
    updateRequest,
    deleteRequest,
    addFolder,
    renameFolder,
    deleteFolder,
    moveRequest,
  };
};
