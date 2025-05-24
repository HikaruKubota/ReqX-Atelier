import { useState, useCallback, useRef, useEffect } from 'react';
import { useHeadersManager } from './useHeadersManager';
import { useBodyManager } from './useBodyManager';
import { useParamsManager } from './useParamsManager';
import type { SavedRequest, RequestEditorState, KeyValuePair } from '../types';

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

  const headersManager = useHeadersManager();
  const bodyManager = useBodyManager(); // Use the new body manager hook
  const paramsManager = useParamsManager();

  const parseQueryPairs = useCallback((q: string) => {
    if (!q) return [] as KeyValuePair[];
    return q.split('&').map((seg) => {
      const [k, v = ''] = seg.split('=');
      return {
        id: `param-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        keyName: decodeURIComponent(k),
        value: decodeURIComponent(v),
        enabled: true,
      } as KeyValuePair;
    });
  }, []);

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

  // Sync params from URL query string
  useEffect(() => {
    const [, q = ''] = urlState.split('?');
    if (q !== paramsManager.queryStringRef.current) {
      const parsed = parseQueryPairs(q);
      const disabled = paramsManager.paramsRef.current.filter((p) => !p.enabled);
      paramsManager.setParams([...disabled, ...parsed]);
    }
  }, [urlState, parseQueryPairs, paramsManager]);

  // Reflect params into URL
  useEffect(() => {
    const base = urlRef.current.split('?')[0];
    const q = paramsManager.queryStringRef.current;
    const newUrl = q ? `${base}?${q}` : base;
    if (newUrl !== urlState) {
      setUrlState(newUrl);
    }
  }, [paramsManager.queryString, urlState, paramsManager, urlRef]);

  const loadRequest = useCallback(
    (req: SavedRequest) => {
      setMethodState(req.method);
      setUrlState(req.url);
      bodyManager.loadBody(req.body || []); // Use bodyManager
      paramsManager.loadParams(req.params || []);
      headersManager.loadHeaders(req.headers || []);
      setActiveRequestIdState(req.id);
      setRequestNameForSaveState(req.name);
    },
    [headersManager, bodyManager, paramsManager],
  ); // Add bodyManager to dependencies

  const resetEditor = useCallback(() => {
    setMethodState('GET');
    setUrlState('');
    bodyManager.resetBody(); // Use bodyManager
    paramsManager.resetParams();
    headersManager.resetHeaders();
    setActiveRequestIdState(null);
    setRequestNameForSaveState('');
  }, [headersManager, bodyManager, paramsManager]); // Add bodyManager to dependencies

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
    loadRequest,
    resetEditor,
  };
};
