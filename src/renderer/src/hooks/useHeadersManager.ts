import { useState, useCallback, useRef } from 'react';
import type { RequestHeader, UseHeadersManagerReturn } from '../types';

const initialHeaders: RequestHeader[] = [];

export const useHeadersManager = (): UseHeadersManagerReturn => {
  const [headersState, setHeadersState] = useState<RequestHeader[]>(initialHeaders);
  const headersRef = useRef<RequestHeader[]>(headersState);

  // Exposed setter that also updates the ref
  const setHeaders = useCallback((newHeaders: RequestHeader[]) => {
    setHeadersState(newHeaders);
    headersRef.current = newHeaders;
  }, []);

  const loadHeaders = useCallback((loadedHeaders: RequestHeader[]) => {
    setHeadersState(loadedHeaders && loadedHeaders.length > 0 ? loadedHeaders : initialHeaders);
    headersRef.current = loadedHeaders && loadedHeaders.length > 0 ? loadedHeaders : initialHeaders;
  }, []);

  const resetHeaders = useCallback(() => {
    setHeadersState(initialHeaders);
    headersRef.current = initialHeaders;
  }, []);

  // Effect to sync ref when headersState changes directly (e.g. by addHeader, updateHeader, removeHeader updates)
  // This ensures the ref is always up-to-date if the state is modified by internal callbacks.
  // Note: The direct ref updates within add/update/remove are an attempt to make it immediately consistent.
  // useEffect provides a more robust way to ensure sync if direct manipulation was complex.
  // However, with the current direct updates in callbacks, this useEffect might be redundant if those are perfectly synced.
  // Let's keep it for safety or simplify if direct updates are proven sufficient.
  // Update: Simpler approach - setters update state, useEffect syncs ref from state.
  // This is a common pattern. The setters (add, update, remove) will just call setHeadersState.

  // Re-evaluating: The current structure where add/update/remove directly modify state and ref is fine.
  // The `setHeaders` callback is for wholesale replacement.
  // Let's simplify the add/update/remove not to depend on `headersState` directly in their definition if `setHeadersState(prev => ...)` is used correctly.

  // Final refined approach for add/update/remove:
  // Use functional updates for setHeadersState to ensure they use the latest state.
  // And update ref inside them or rely on a single useEffect for ref synchronization.
  // For simplicity and to avoid potential stale closure issues with `headersState` in `useCallback` without it in deps:
  // Let's ensure ref is synced after each state update using setHeadersState's callback or a single useEffect.

  // Corrected addHeader, updateHeader, removeHeader to avoid stale closures on headersState
  // and ensure ref is correctly synced.

  const addHeaderCorrected = useCallback(() => {
    const newHeader = {
      id: `header-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      key: '',
      value: '',
      enabled: true,
    };
    setHeadersState((prevHeaders) => {
      const newHeaders = [...prevHeaders, newHeader];
      headersRef.current = newHeaders;
      return newHeaders;
    });
  }, []);

  const updateHeaderCorrected = useCallback(
    (id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => {
      setHeadersState((prevHeaders) => {
        const newHeaders = prevHeaders.map((h) => (h.id === id ? { ...h, [field]: value } : h));
        headersRef.current = newHeaders;
        return newHeaders;
      });
    },
    [],
  );

  const removeHeaderCorrected = useCallback((id: string) => {
    setHeadersState((prevHeaders) => {
      const newHeaders = prevHeaders.filter((h) => h.id !== id);
      headersRef.current = newHeaders;
      return newHeaders;
    });
  }, []);

  const moveHeader = useCallback((activeId: string, overId: string) => {
    setHeadersState((prevHeaders) => {
      const oldIndex = prevHeaders.findIndex((h) => h.id === activeId);
      const newIndex = prevHeaders.findIndex((h) => h.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prevHeaders;
      const newHeaders = [...prevHeaders];
      const [moved] = newHeaders.splice(oldIndex, 1);
      newHeaders.splice(newIndex, 0, moved);
      headersRef.current = newHeaders;
      return newHeaders;
    });
  }, []);

  return {
    headers: headersState,
    setHeaders, // The main setter for replacing all headers
    headersRef,
    addHeader: addHeaderCorrected, // Use corrected versions
    updateHeader: updateHeaderCorrected,
    removeHeader: removeHeaderCorrected,
    moveHeader,
    loadHeaders,
    resetHeaders,
  };
};
