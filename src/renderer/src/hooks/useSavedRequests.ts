import { useState, useEffect, useCallback } from 'react';
import type { KeyValuePair, SavedRequest, RequestFolder } from '../types';

const LOCAL_STORAGE_KEY = 'reqx_saved_requests_v2';

interface StoredData {
  folders: RequestFolder[];
  requests: SavedRequest[];
}

const createDefaultFolder = (): RequestFolder => ({
  id: `folder-${Date.now()}`,
  name: 'Default',
});

export const useSavedRequests = () => {
  const [folders, setFolders] = useState<RequestFolder[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredData | SavedRequest[];
        if (Array.isArray(parsed)) {
          setFolders([createDefaultFolder()]);
          setSavedRequests(
            (parsed as SavedRequest[]).map((r) => ({
              ...r,
              folderId: r.folderId || 'default',
            })),
          );
        } else {
          setFolders(parsed.folders.length > 0 ? parsed.folders : [createDefaultFolder()]);
          setSavedRequests(parsed.requests || []);
        }
      } catch (e) {
        console.error('Failed to parse saved data', e);
        setFolders([createDefaultFolder()]);
        setSavedRequests([]);
      }
    } else {
      setFolders([createDefaultFolder()]);
    }
  }, []);

  useEffect(() => {
    const data: StoredData = { folders, requests: savedRequests };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [folders, savedRequests]);

  const addFolder = useCallback((name: string): string => {
    const id = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const folder = { id, name: name.trim() || 'Untitled Folder' };
    setFolders((prev) => [...prev, folder]);
    return id;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setSavedRequests((prev) => prev.filter((r) => r.folderId !== id));
  }, []);

  const addRequest = useCallback(
    (
      request: Omit<SavedRequest, 'id' | 'bodyKeyValuePairs'> & {
        bodyKeyValuePairs?: KeyValuePair[];
      },
    ): string => {
      const newId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newRequest: SavedRequest = {
        ...request,
        id: newId,
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

  return {
    folders,
    savedRequests,
    addFolder,
    deleteFolder,
    addRequest,
    updateRequest,
    deleteRequest,
  };
};
