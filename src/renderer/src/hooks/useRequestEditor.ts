import { useState, useEffect, useRef, useCallback } from 'react';
import type { SavedRequest } from './useSavedRequests'; // Assuming SavedRequest is exported from here

export interface RequestEditorState {
  method: string;
  url: string;
  requestBody: string;
  requestNameForSave: string;
  activeRequestId: string | null;
}

export const useRequestEditor = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [requestNameForSave, setRequestNameForSave] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const methodRef = useRef(method);
  const urlRef = useRef(url);
  const requestBodyRef = useRef(requestBody);
  const requestNameForSaveRef = useRef(requestNameForSave);
  const activeRequestIdRef = useRef(activeRequestId);

  useEffect(() => { methodRef.current = method; }, [method]);
  useEffect(() => { urlRef.current = url; }, [url]);
  useEffect(() => { requestBodyRef.current = requestBody; }, [requestBody]);
  useEffect(() => { requestNameForSaveRef.current = requestNameForSave; }, [requestNameForSave]);
  useEffect(() => { activeRequestIdRef.current = activeRequestId; }, [activeRequestId]);

  const loadRequest = useCallback((req: SavedRequest) => {
    setMethod(req.method);
    setUrl(req.url);
    setRequestBody(req.body || '');
    setRequestNameForSave(req.name);
    setActiveRequestId(req.id);
  }, []);

  const resetEditor = useCallback(() => {
    setMethod('GET');
    setUrl('');
    setRequestBody('');
    setRequestNameForSave('');
    setActiveRequestId(null);
  }, []);

  return {
    method, setMethod, methodRef,
    url, setUrl, urlRef,
    requestBody, setRequestBody, requestBodyRef,
    requestNameForSave, setRequestNameForSave, requestNameForSaveRef,
    activeRequestId, setActiveRequestId, activeRequestIdRef,
    loadRequest,
    resetEditor,
  };
};
