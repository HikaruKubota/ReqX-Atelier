import { useState, useCallback, useRef, useEffect } from 'react';
import { SavedRequest } from './useSavedRequests';
import type { KeyValuePair } from '../components/BodyEditorKeyValue';
import {
  useHeadersManager,
  // RequestHeader, // RequestHeader is implicitly part of UseHeadersManagerReturn
  UseHeadersManagerReturn
} from './useHeadersManager';

export interface RequestEditorState extends Omit<UseHeadersManagerReturn, 'loadHeaders' | 'resetHeaders'> {
  method: string;
  setMethod: (method: string) => void;
  methodRef: React.MutableRefObject<string>;
  url: string;
  setUrl: (url: string) => void;
  urlRef: React.MutableRefObject<string>;
  requestBody: string;
  setRequestBody: (body: string) => void;
  requestBodyRef: React.MutableRefObject<string>;
  currentBodyKeyValuePairs: KeyValuePair[];
  setCurrentBodyKeyValuePairs: (pairs: KeyValuePair[]) => void;
  currentBodyKeyValuePairsRef: React.MutableRefObject<KeyValuePair[]>;
  requestNameForSave: string;
  setRequestNameForSave: (name: string) => void;
  requestNameForSaveRef: React.MutableRefObject<string>;
  activeRequestId: string | null;
  setActiveRequestId: (id: string | null) => void;
  activeRequestIdRef: React.MutableRefObject<string | null>;
  loadRequest: (request: SavedRequest) => void;
  resetEditor: () => void;
}

// const initialHeaders: RequestHeader[] = []; // Remove: Defined in useHeadersManager

export const useRequestEditor = (): RequestEditorState => {
  const [methodState, setMethodState] = useState('GET');
  const methodRef = useRef(methodState);
  const setMethod = useCallback((val: string) => { setMethodState(val); methodRef.current = val; }, []);

  const [urlState, setUrlState] = useState('');
  const urlRef = useRef(urlState);
  const setUrl = useCallback((val: string) => { setUrlState(val); urlRef.current = val; }, []);

  const [requestBodyState, setRequestBodyState] = useState('');
  const requestBodyRef = useRef(requestBodyState);
  const setRequestBody = useCallback((val: string) => { setRequestBodyState(val); requestBodyRef.current = val; }, []);

  const [currentBodyKeyValuePairsState, setCurrentBodyKeyValuePairsState] = useState<KeyValuePair[]>([]);
  const currentBodyKeyValuePairsRef = useRef(currentBodyKeyValuePairsState);
  const setCurrentBodyKeyValuePairs = useCallback((val: KeyValuePair[]) => {
    setCurrentBodyKeyValuePairsState(val);
    currentBodyKeyValuePairsRef.current = val;
  }, []);

  const [requestNameForSaveState, setRequestNameForSaveState] = useState('');
  const requestNameForSaveRef = useRef(requestNameForSaveState);
  const setRequestNameForSave = useCallback((val: string) => { setRequestNameForSaveState(val); requestNameForSaveRef.current = val; }, []);

  const [activeRequestIdState, setActiveRequestIdState] = useState<string | null>(null);
  const activeRequestIdRef = useRef(activeRequestIdState);
  const setActiveRequestId = useCallback((val: string | null) => { setActiveRequestIdState(val); activeRequestIdRef.current = val; }, []);

  const {
    headers: headersState,
    setHeaders: setHeadersFromManager, // Get setHeaders from manager
    headersRef: managedHeadersRef,
    addHeader: addHeaderFromManager,
    updateHeader: updateHeaderFromManager,
    removeHeader: removeHeaderFromManager,
    loadHeaders,
    resetHeaders
  } = useHeadersManager();

  // Remove useEffects for headersState and headersRef as they are managed by useHeadersManager
  useEffect(() => { methodRef.current = methodState; }, [methodState]);
  useEffect(() => { urlRef.current = urlState; }, [urlState]);
  useEffect(() => { requestBodyRef.current = requestBodyState; }, [requestBodyState]);
  useEffect(() => { currentBodyKeyValuePairsRef.current = currentBodyKeyValuePairsState; }, [currentBodyKeyValuePairsState]);
  useEffect(() => { requestNameForSaveRef.current = requestNameForSaveState; }, [requestNameForSaveState]);
  useEffect(() => { activeRequestIdRef.current = activeRequestIdState; }, [activeRequestIdState]);
  // useEffect(() => { headersRef.current = headersState; }, [headersState]); // Remove this line

  // Remove addHeader, updateHeader, removeHeader direct implementations

  const loadRequest = useCallback((req: SavedRequest) => {
    setMethodState(req.method);
    setUrlState(req.url);
    setCurrentBodyKeyValuePairsState(req.bodyKeyValuePairs || []);

    if (req.bodyKeyValuePairs && req.bodyKeyValuePairs.length > 0) {
      try {
        const jsonObject = req.bodyKeyValuePairs.reduce((obj, pair) => {
          if (pair.enabled && pair.keyName.trim() !== '') {
            try { obj[pair.keyName] = JSON.parse(pair.value); } catch { obj[pair.keyName] = pair.value; }
          }
          return obj;
        }, {} as Record<string, any>);
        setRequestBodyState(Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '');
      } catch (e) {
        setRequestBodyState('');
      }
    } else {
      setRequestBodyState('');
    }
    loadHeaders(req.headers || []); // Use loadHeaders from useHeadersManager
    setActiveRequestIdState(req.id);
    setRequestNameForSaveState(req.name);
  }, [loadHeaders]); // Add loadHeaders to dependencies

  const resetEditor = useCallback(() => {
    setMethodState('GET');
    setUrlState('');
    setRequestBodyState('');
    setCurrentBodyKeyValuePairsState([]);
    resetHeaders(); // Use resetHeaders from useHeadersManager
    setActiveRequestIdState(null);
    setRequestNameForSaveState('');
  }, [resetHeaders]); // Add resetHeaders to dependencies

  return {
    method: methodState, setMethod,
    url: urlState, setUrl,
    requestBody: requestBodyState, setRequestBody,
    currentBodyKeyValuePairs: currentBodyKeyValuePairsState, setCurrentBodyKeyValuePairs,
    requestNameForSave: requestNameForSaveState, setRequestNameForSave,
    activeRequestId: activeRequestIdState, setActiveRequestId,
    // Headers from useHeadersManager
    headers: headersState,
    setHeaders: setHeadersFromManager, // Expose setHeaders from manager
    headersRef: managedHeadersRef,
    addHeader: addHeaderFromManager,
    updateHeader: updateHeaderFromManager,
    removeHeader: removeHeaderFromManager,
    // Refs for other states
    methodRef, urlRef, requestBodyRef, currentBodyKeyValuePairsRef, requestNameForSaveRef, activeRequestIdRef,
    // Actions
    loadRequest,
    resetEditor
  };
};
