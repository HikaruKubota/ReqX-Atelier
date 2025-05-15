import { useState, useRef, useCallback } from 'react';
import { SavedRequest } from './useSavedRequests'; // Assuming SavedRequest will be updated to include headers

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

const generateHeaderId = () => `header-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const initialHeaders = [{ id: generateHeaderId(), key: '', value: '', enabled: true }];

export const useRequestEditor = (): RequestEditorState => {
  const [method, setMethodState] = useState('GET');
  const methodRef = useRef(method);
  const setMethod = useCallback((val: string) => { setMethodState(val); methodRef.current = val; }, []);

  const [url, setUrlState] = useState('');
  const urlRef = useRef(url);
  const setUrl = useCallback((val: string) => { setUrlState(val); urlRef.current = val; }, []);

  const [requestBody, setRequestBodyState] = useState('');
  const requestBodyRef = useRef(requestBody);
  const setRequestBody = useCallback((val: string) => { setRequestBodyState(val); requestBodyRef.current = val; }, []);

  const [requestNameForSave, setRequestNameForSaveState] = useState('');
  const requestNameForSaveRef = useRef(requestNameForSave);
  const setRequestNameForSave = useCallback((val: string) => { setRequestNameForSaveState(val); requestNameForSaveRef.current = val; }, []);

  const [activeRequestId, setActiveRequestIdState] = useState<string | null>(null);
  const activeRequestIdRef = useRef(activeRequestId);
  const setActiveRequestId = useCallback((val: string | null) => { setActiveRequestIdState(val); activeRequestIdRef.current = val; }, []);

  const [headers, setHeadersState] = useState<RequestHeader[]>(initialHeaders);
  const headersRef = useRef(headers);
  const setHeaders = useCallback((val: RequestHeader[]) => { setHeadersState(val); headersRef.current = val; }, []);

  const addHeader = useCallback(() => {
    setHeaders([...headersRef.current, { id: generateHeaderId(), key: '', value: '', enabled: true }]);
  }, [setHeaders]);

  const updateHeader = useCallback((id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => {
    setHeaders(headersRef.current.map(h => h.id === id ? { ...h, [field]: value } : h));
  }, [setHeaders]);

  const removeHeader = useCallback((id: string) => {
    setHeaders(headersRef.current.filter(h => h.id !== id));
  }, [setHeaders]);

  const resetEditor = useCallback(() => {
    setMethod('GET');
    setUrl('');
    // setRequestBody(''); // Body should be reset separately if needed by caller, or based on method
    setRequestNameForSave('');
    setActiveRequestId(null);
    setHeaders(initialHeaders); // Reset headers to initial state
  }, [setMethod, setUrl, setRequestNameForSave, setActiveRequestId, setHeaders]);

  const loadRequest = useCallback((request: SavedRequest) => {
    setMethod(request.method);
    setUrl(request.url);
    setRequestBody(request.body || '');
    setRequestNameForSave(request.name);
    setActiveRequestId(request.id || null);
    setHeaders(request.headers && request.headers.length > 0 ? request.headers : initialHeaders); // Load headers or set initial
  }, [setMethod, setUrl, setRequestBody, setRequestNameForSave, setActiveRequestId, setHeaders]);

  return {
    method, setMethod, methodRef,
    url, setUrl, urlRef,
    requestBody, setRequestBody, requestBodyRef,
    requestNameForSave, setRequestNameForSave, requestNameForSaveRef,
    activeRequestId, setActiveRequestId, activeRequestIdRef,
    headers, setHeaders, headersRef,
    addHeader,
    updateHeader,
    removeHeader,
    loadRequest,
    resetEditor,
  };
};
