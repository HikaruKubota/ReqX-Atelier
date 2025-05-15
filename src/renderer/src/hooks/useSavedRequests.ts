import { useState, useEffect, useCallback } from 'react';
import type { RequestHeader } from './useRequestEditor'; // Import RequestHeader type

// Define the structure of a saved request
export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  body?: string;
  headers?: RequestHeader[]; // Add headers property
}

const LOCAL_STORAGE_KEY = 'reqx_saved_requests';

export const useSavedRequests = () => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);

  // Load saved requests from localStorage on initial mount
  useEffect(() => {
    const storedRequests = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedRequests) {
      try {
        const parsedRequests = JSON.parse(storedRequests);
        // Ensure all loaded requests have an id (for backward compatibility if needed)
        const requestsWithIds = parsedRequests.map((req: Partial<SavedRequest>) => ({
          ...req,
          id: req.id || `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: req.name || 'Untitled Request',
          method: req.method || 'GET',
          url: req.url || '',
          headers: req.headers || [], // Ensure headers array exists
        })) as SavedRequest[];
        setSavedRequests(requestsWithIds);
      } catch (error) {
        console.error("Failed to parse saved requests from localStorage:", error);
        setSavedRequests([]); // Fallback to empty array on error
      }
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedRequests));
  }, [savedRequests]);

  const addRequest = useCallback((request: Omit<SavedRequest, 'id'>): string => {
    const newId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRequest = { ...request, id: newId, headers: request.headers || [] };
    setSavedRequests(prevRequests => [...prevRequests, newRequest]);
    return newId;
  }, []);

  const updateRequest = useCallback((id: string, updatedFields: Partial<Omit<SavedRequest, 'id'>>) => {
    setSavedRequests(prevRequests =>
      prevRequests.map(req => (req.id === id ? { ...req, ...updatedFields } : req))
    );
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setSavedRequests(prevRequests => prevRequests.filter(req => req.id !== id));
  }, []);

  return { savedRequests, addRequest, updateRequest, deleteRequest };
};
