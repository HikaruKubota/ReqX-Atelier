import { useState, useCallback, useRef, useEffect } from 'react';
import { useHeadersManager } from './useHeadersManager';
import { useBodyManager } from './useBodyManager';
import { useParamsManager } from './useParamsManager';
import type { SavedRequest, RequestEditorState, VariableExtraction } from '../types';

// RequestEditorState now inherits from both manager returns, excluding conflicting/internal methods

// const initialHeaders: RequestHeader[] = []; // Remove: Defined in useHeadersManager

export const useRequestEditor = (): RequestEditorState => {
  const [methodState, setMethodState] = useState('GET');
  const methodRef = useRef(methodState);
  const setMethod = useCallback((val: string) => {
    setMethodState(val);
    methodRef.current = val;
  }, []);

  const [urlState, setUrlState] = useState('');
  const urlRef = useRef(urlState);
  const setUrl = useCallback((val: string) => {
    setUrlState(val);
    urlRef.current = val;
  }, []);

  const [requestNameForSaveState, setRequestNameForSaveState] = useState('');
  const requestNameForSaveRef = useRef(requestNameForSaveState);
  const setRequestNameForSave = useCallback((val: string) => {
    setRequestNameForSaveState(val);
    requestNameForSaveRef.current = val;
  }, []);

  const [activeRequestIdState, setActiveRequestIdState] = useState<string | null>(null);
  const activeRequestIdRef = useRef(activeRequestIdState);
  const setActiveRequestId = useCallback((val: string | null) => {
    setActiveRequestIdState(val);
    activeRequestIdRef.current = val;
  }, []);

  const [variableExtractionState, setVariableExtractionState] = useState<
    VariableExtraction | undefined
  >(undefined);
  const variableExtractionRef = useRef(variableExtractionState);
  const setVariableExtraction = useCallback((val: VariableExtraction | undefined) => {
    setVariableExtractionState(val);
    variableExtractionRef.current = val;
  }, []);

  const headersManager = useHeadersManager();
  const bodyManager = useBodyManager(); // Use the new body manager hook
  const paramsManager = useParamsManager();

  // Removed old sync implementation - now handled by useUrlParamsSync hook

  // Remove useEffects for body-related states
  useEffect(() => {
    methodRef.current = methodState;
  }, [methodState]);
  useEffect(() => {
    urlRef.current = urlState;
  }, [urlState]);
  // useEffect(() => { requestBodyRef.current = requestBodyState; }, [requestBodyState]); // Remove
  // useEffect(() => { currentBodyKeyValuePairsRef.current = currentBodyKeyValuePairsState; }, [currentBodyKeyValuePairsState]); // Remove
  useEffect(() => {
    requestNameForSaveRef.current = requestNameForSaveState;
  }, [requestNameForSaveState]);
  useEffect(() => {
    activeRequestIdRef.current = activeRequestIdState;
  }, [activeRequestIdState]);
  useEffect(() => {
    variableExtractionRef.current = variableExtractionState;
  }, [variableExtractionState]);

  // Old URL-params sync removed - now handled by useUrlParamsSync hook in App.tsx
  // The bidirectional sync between URL and params is now managed at the App level
  // to avoid conflicts and ensure proper state management across tabs

  const loadRequest = useCallback(
    (req: SavedRequest) => {
      setMethodState(req.method);
      setUrlState(req.url);
      bodyManager.loadBody(req.body || []); // Use bodyManager
      paramsManager.loadParams(req.params || []);
      headersManager.loadHeaders(req.headers || []);
      setActiveRequestIdState(req.id);
      setRequestNameForSaveState(req.name);
      setVariableExtractionState(req.variableExtraction);
    },
    [headersManager, bodyManager, paramsManager],
  );

  const resetEditor = useCallback(() => {
    setMethodState('GET');
    setUrlState('');
    bodyManager.resetBody(); // Use bodyManager
    paramsManager.resetParams();
    headersManager.resetHeaders();
    setActiveRequestIdState(null);
    setRequestNameForSaveState('');
    setVariableExtractionState(undefined);
  }, [headersManager, bodyManager, paramsManager]);

  return {
    method: methodState,
    setMethod,
    url: urlState,
    setUrl,
    ...headersManager, // Spread headers manager return values
    ...bodyManager, // Spread body manager return values
    ...paramsManager,
    requestNameForSave: requestNameForSaveState,
    setRequestNameForSave,
    activeRequestId: activeRequestIdState,
    setActiveRequestId,
    methodRef,
    urlRef,
    // requestBodyRef, currentBodyKeyValuePairsRef, // These are now part of bodyManager
    requestNameForSaveRef,
    activeRequestIdRef,
    // headersRef is part of headersManager
    variableExtraction: variableExtractionState,
    setVariableExtraction,
    variableExtractionRef,
    loadRequest,
    resetEditor,
  };
};
