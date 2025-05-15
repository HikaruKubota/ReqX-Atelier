import { useState, useCallback, useRef, useEffect } from 'react';
import { SavedRequest } from './useSavedRequests'; // Assuming SavedRequest will be updated to include headers
import type { KeyValuePair } from '../components/BodyEditorKeyValue'; // Import KeyValuePair

// Define the type for a single header item
export interface RequestHeader {
  id: string; // Unique ID for React list keys
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestEditorState {
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
  headers: RequestHeader[];
  setHeaders: (headers: RequestHeader[]) => void;
  headersRef: React.MutableRefObject<RequestHeader[]>;
  addHeader: () => void;
  updateHeader: (id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => void;
  removeHeader: (id: string) => void;
  loadRequest: (request: SavedRequest) => void;
  resetEditor: () => void;
}

const initialHeaders: RequestHeader[] = []; // Define initialHeaders

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

  const [headersState, setHeadersState] = useState<RequestHeader[]>(initialHeaders);
  const headersRef = useRef(headersState);
  const setHeaders = useCallback((val: RequestHeader[]) => { setHeadersState(val); headersRef.current = val; }, []);

  // Update refs only if the state variables themselves are directly used elsewhere
  // For method, url, etc. that have specific setters updating refs, this is redundant if state itself isn't returned directly by those names
  useEffect(() => { methodRef.current = methodState; }, [methodState]);
  useEffect(() => { urlRef.current = urlState; }, [urlState]);
  useEffect(() => { requestBodyRef.current = requestBodyState; }, [requestBodyState]);
  useEffect(() => { currentBodyKeyValuePairsRef.current = currentBodyKeyValuePairsState; }, [currentBodyKeyValuePairsState]);
  useEffect(() => { requestNameForSaveRef.current = requestNameForSaveState; }, [requestNameForSaveState]);
  useEffect(() => { activeRequestIdRef.current = activeRequestIdState; }, [activeRequestIdState]);
  useEffect(() => { headersRef.current = headersState; }, [headersState]);

  const addHeader = useCallback(() => {
    setHeadersState(prev => [...prev, { id: `header-${Date.now()}-${Math.random()}`, key: '', value: '', enabled: true }]);
  }, []);

  const updateHeader = useCallback((id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => {
    setHeadersState(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  }, []);

  const removeHeader = useCallback((id: string) => {
    setHeadersState(prev => prev.filter(h => h.id !== id));
  }, []);

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
    setHeadersState(req.headers || initialHeaders);
    setActiveRequestIdState(req.id);
    setRequestNameForSaveState(req.name);
  }, []); // Dependencies for setters are stable

  const resetEditor = useCallback(() => {
    setMethodState('GET');
    setUrlState('');
    setRequestBodyState('');
    setCurrentBodyKeyValuePairsState([]);
    setHeadersState(initialHeaders); // Use defined initialHeaders
    setActiveRequestIdState(null);
    setRequestNameForSaveState('');
  }, []); // Dependencies for setters are stable

  return {
    method: methodState, setMethod,
    url: urlState, setUrl,
    requestBody: requestBodyState, setRequestBody,
    currentBodyKeyValuePairs: currentBodyKeyValuePairsState, setCurrentBodyKeyValuePairs,
    requestNameForSave: requestNameForSaveState, setRequestNameForSave,
    activeRequestId: activeRequestIdState, setActiveRequestId,
    headers: headersState, setHeaders,
    // Returning refs if they are intended to be used by consumers for direct, non-reactive access
    methodRef, urlRef, requestBodyRef, currentBodyKeyValuePairsRef, requestNameForSaveRef, activeRequestIdRef, headersRef,
    addHeader, updateHeader, removeHeader,
    loadRequest,
    resetEditor
  };
};
