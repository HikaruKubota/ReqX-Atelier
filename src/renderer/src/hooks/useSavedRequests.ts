import { useState, useEffect, useCallback } from 'react';

// Define the shape of a saved request
export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  body?: string; // Optional as GET/HEAD requests might not have a body
}

const LOCAL_STORAGE_KEY = 'reqx_saved_requests';

export const useSavedRequests = () => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>(() => {
    try {
      const items = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error("Error reading saved requests from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedRequests));
    } catch (error) {
      console.error("Error saving requests to localStorage", error);
    }
  }, [savedRequests]);

  const addRequest = useCallback((requestData: Omit<SavedRequest, 'id'>): string => {
    const newId = Date.now().toString(); // Simple ID generation
    const newRequest: SavedRequest = { ...requestData, id: newId };
    setSavedRequests(prevRequests => [...prevRequests, newRequest]);
    return newId;
  }, []);

  const updateRequest = useCallback((id: string, updatedData: Omit<SavedRequest, 'id'>) => {
    setSavedRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id ? { ...req, ...updatedData, id } : req
      )
    );
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setSavedRequests(prevRequests => prevRequests.filter(req => req.id !== id));
  }, []);

  return {
    savedRequests,
    addRequest,
    updateRequest,
    deleteRequest,
  };
};
