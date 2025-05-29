import { useEffect, useRef } from 'react';
import type { RequestEditorState, RequestHeader, KeyValuePair } from '../types';

interface UseTabDirtyTrackerProps {
  tabId: string | null;
  requestEditor: RequestEditorState;
  markTabDirty: (tabId: string) => void;
  markTabClean: (tabId: string) => void;
}

export const useTabDirtyTracker = ({
  tabId,
  requestEditor,
  markTabDirty,
  markTabClean,
}: UseTabDirtyTrackerProps) => {
  const initialValuesRef = useRef<{
    method: string;
    url: string;
    requestNameForSave: string;
    headers: RequestHeader[];
    body: KeyValuePair[];
    params: KeyValuePair[];
  } | null>(null);

  const currentValuesRef = useRef<{
    method: string;
    url: string;
    requestNameForSave: string;
    headers: RequestHeader[];
    body: KeyValuePair[];
    params: KeyValuePair[];
  } | null>(null);

  // Track initial values when tab is created or request is loaded
  const setInitialValues = () => {
    if (!tabId) return;
    
    const values = {
      method: requestEditor.method,
      url: requestEditor.url,
      requestNameForSave: requestEditor.requestNameForSave,
      headers: requestEditor.headers,
      body: requestEditor.body,
      params: requestEditor.params,
    };
    
    initialValuesRef.current = JSON.parse(JSON.stringify(values));
    currentValuesRef.current = JSON.parse(JSON.stringify(values));
  };

  // Check if values have changed
  const checkForChanges = () => {
    if (!tabId || !initialValuesRef.current) return;

    const currentValues = {
      method: requestEditor.method,
      url: requestEditor.url,
      requestNameForSave: requestEditor.requestNameForSave,
      headers: requestEditor.headers,
      body: requestEditor.body,
      params: requestEditor.params,
    };

    const hasChanged = JSON.stringify(currentValues) !== JSON.stringify(initialValuesRef.current);
    
    if (hasChanged) {
      markTabDirty(tabId);
    } else {
      markTabClean(tabId);
    }

    currentValuesRef.current = JSON.parse(JSON.stringify(currentValues));
  };

  // Reset dirty state (called when saving or sending request)
  const resetDirtyState = () => {
    if (!tabId) return;
    
    setInitialValues();
    markTabClean(tabId);
  };

  // Set initial values when tab changes or request is loaded
  useEffect(() => {
    if (!tabId) return;
    
    // Always mark tab as clean when switching tabs initially
    markTabClean(tabId);
    
    // Set initial values immediately to establish baseline
    setInitialValues();
  }, [tabId, requestEditor.activeRequestId]);

  // Watch for changes in editor values (but only after initial values are set)
  useEffect(() => {
    // Skip check if no initial values are set yet
    if (!initialValuesRef.current) return;
    
    checkForChanges();
  }, [
    requestEditor.method,
    requestEditor.url,
    requestEditor.requestNameForSave,
    requestEditor.headers,
    requestEditor.body,
    requestEditor.params,
    tabId,
  ]);

  return {
    setInitialValues,
    resetDirtyState,
  };
};