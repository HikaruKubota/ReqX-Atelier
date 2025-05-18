import { useState, useEffect, useCallback } from 'react';
import type { RequestHeader } from './useHeadersManager';
import type { KeyValuePair } from '../components/BodyEditorKeyValue'; // Import KeyValuePair

// Define the structure of a saved request
export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers?: RequestHeader[];
  bodyKeyValuePairs?: KeyValuePair[]; // Add new body structure
}

const LOCAL_STORAGE_KEY = 'reqx_saved_requests';

export const useSavedRequests = () => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);

  // Load saved requests from localStorage on initial mount
  useEffect(() => {
    const storedRequests = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedRequests) {
      try {
        const parsedRequests = JSON.parse(storedRequests) as Array<
          Partial<SavedRequest> & { body?: string }
        >; // Type assertion for migration
        // Ensure all loaded requests have an id (for backward compatibility if needed)
        const requestsWithIds = parsedRequests.map((req) => {
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
      } catch (error) {
        console.error('Failed to parse saved requests from localStorage:', error);
        setSavedRequests([]); // Fallback to empty array on error
      }
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    // Before saving, ensure no 'body' property is lingering from old structures if migration happened elsewhere
    const requestsToSave = savedRequests.map((req) => {
      const { body, ...rest } = req as any; // eslint-disable-line @typescript-eslint/no-unused-vars
      return rest;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requestsToSave));
  }, [savedRequests]);

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

  return { savedRequests, addRequest, updateRequest, deleteRequest };
};
