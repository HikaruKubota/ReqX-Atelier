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

  // Sync refs with state values
  useEffect(() => {
    methodRef.current = methodState;
  }, [methodState]);
  useEffect(() => {
    urlRef.current = urlState;
  }, [urlState]);
  useEffect(() => {
    requestNameForSaveRef.current = requestNameForSaveState;
  }, [requestNameForSaveState]);
  useEffect(() => {
    activeRequestIdRef.current = activeRequestIdState;
  }, [activeRequestIdState]);

  // Update URL when params change (unidirectional: params -> URL)
  const updateUrlWithParams = useCallback((newParams: KeyValuePair[], currentUrl: string) => {
    const base = currentUrl.split('?')[0];
    const q = newParams
      .filter((p) => p.enabled && p.keyName.trim() !== '')
      .map((p) => `${encodeURIComponent(p.keyName)}=${encodeURIComponent(p.value)}`)
      .join('&');
    const newUrl = q ? `${base}?${q}` : base;
    if (newUrl !== currentUrl) {
      setUrlState(newUrl);
      urlRef.current = newUrl;
    }
  }, []);

  // Override setUrl to parse query params when URL changes
  const setUrlWithParamSync = useCallback((val: string) => {
    setUrlState(val);
    urlRef.current = val;
    
    // Parse query params from the new URL
    const [, q = ''] = val.split('?');
    const parsed = parseQueryPairs(q);
    const disabled = paramsManager.params.filter((p) => !p.enabled);
    const next = [...disabled, ...parsed];
    
    // Check if params actually changed
    const prev = paramsManager.params;
    const isSame =
      prev.length === next.length &&
      prev.every((p, i) => p.enabled === next[i].enabled &&
                           p.keyName === next[i].keyName &&
                           p.value === next[i].value);
    if (!isSame) {
      paramsManager.setParams(next);
    }
  }, [parseQueryPairs, paramsManager]);

  // Override setParams to update URL
  const setParamsWithUrlSync = useCallback((pairs: KeyValuePair[]) => {
    paramsManager.setParams(pairs);
    updateUrlWithParams(pairs, urlRef.current);
  }, [paramsManager, updateUrlWithParams]);

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
    setUrl: setUrlWithParamSync, // Use the new sync function
    ...headersManager, // Spread headers manager return values
    ...bodyManager, // Spread body manager return values
    ...paramsManager,
    params: paramsManager.params,
    setParams: setParamsWithUrlSync, // Override with sync function
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
