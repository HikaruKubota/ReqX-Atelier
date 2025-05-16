import { useState, useCallback, useRef, useEffect } from 'react';
import { SavedRequest } from './useSavedRequests';
// KeyValuePair is now primarily used by useBodyManager and BodyEditorKeyValue
// import type { KeyValuePair } from '../components/BodyEditorKeyValue';
import {
  useHeadersManager,
  // RequestHeader, // RequestHeader is implicitly part of UseHeadersManagerReturn
  UseHeadersManagerReturn
} from './useHeadersManager';
import {
  useBodyManager,
  UseBodyManagerReturn
} from './useBodyManager'; // Import from new body hook

// RequestEditorState now inherits from both manager returns, excluding conflicting/internal methods
export interface RequestEditorState
  extends Omit<UseHeadersManagerReturn, 'loadHeaders' | 'resetHeaders'>,
          Omit<UseBodyManagerReturn, 'loadBodyKeyValuePairs' | 'resetBody'> {
  method: string;
  setMethod: (method: string) => void;
  methodRef: { current: string };
  url: string;
  setUrl: (url: string) => void;
  urlRef: { current: string };
  // Body related types are now part of UseBodyManagerReturn
  // Headers related types are now part of UseHeadersManagerReturn
  requestNameForSave: string;
  setRequestNameForSave: (name: string) => void;
  requestNameForSaveRef: { current: string };
  activeRequestId: string | null;
  setActiveRequestId: (id: string | null) => void;
  activeRequestIdRef: { current: string | null };
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

  // Remove direct body state management
  // const [requestBodyState, setRequestBodyState] = useState('');
  // const requestBodyRef = useRef(requestBodyState);
  // const setRequestBody = useCallback((val: string) => { setRequestBodyState(val); requestBodyRef.current = val; }, []);
  // const [currentBodyKeyValuePairsState, setCurrentBodyKeyValuePairsState] = useState<KeyValuePair[]>([]);
  // const currentBodyKeyValuePairsRef = useRef(currentBodyKeyValuePairsState);
  // const setCurrentBodyKeyValuePairs = useCallback((val: KeyValuePair[]) => { ... });

  const [requestNameForSaveState, setRequestNameForSaveState] = useState('');
  const requestNameForSaveRef = useRef(requestNameForSaveState);
  const setRequestNameForSave = useCallback((val: string) => { setRequestNameForSaveState(val); requestNameForSaveRef.current = val; }, []);

  const [activeRequestIdState, setActiveRequestIdState] = useState<string | null>(null);
  const activeRequestIdRef = useRef(activeRequestIdState);
  const setActiveRequestId = useCallback((val: string | null) => { setActiveRequestIdState(val); activeRequestIdRef.current = val; }, []);

  const headersManager = useHeadersManager();
  const bodyManager = useBodyManager(); // Use the new body manager hook

  // Remove useEffects for body-related states
  useEffect(() => { methodRef.current = methodState; }, [methodState]);
  useEffect(() => { urlRef.current = urlState; }, [urlState]);
  // useEffect(() => { requestBodyRef.current = requestBodyState; }, [requestBodyState]); // Remove
  // useEffect(() => { currentBodyKeyValuePairsRef.current = currentBodyKeyValuePairsState; }, [currentBodyKeyValuePairsState]); // Remove
  useEffect(() => { requestNameForSaveRef.current = requestNameForSaveState; }, [requestNameForSaveState]);
  useEffect(() => { activeRequestIdRef.current = activeRequestIdState; }, [activeRequestIdState]);

  const loadRequest = useCallback((req: SavedRequest) => {
    setMethodState(req.method);
    setUrlState(req.url);
    bodyManager.loadBodyKeyValuePairs(req.bodyKeyValuePairs || []); // Use bodyManager
    headersManager.loadHeaders(req.headers || []);
    setActiveRequestIdState(req.id);
    setRequestNameForSaveState(req.name);
  }, [headersManager, bodyManager]); // Add bodyManager to dependencies

  const resetEditor = useCallback(() => {
    setMethodState('GET');
    setUrlState('');
    bodyManager.resetBody(); // Use bodyManager
    headersManager.resetHeaders();
    setActiveRequestIdState(null);
    setRequestNameForSaveState('');
  }, [headersManager, bodyManager]); // Add bodyManager to dependencies

  return {
    method: methodState, setMethod,
    url: urlState, setUrl,
    ...headersManager, // Spread headers manager return values
    ...bodyManager,    // Spread body manager return values
    requestNameForSave: requestNameForSaveState, setRequestNameForSave,
    activeRequestId: activeRequestIdState, setActiveRequestId,
    methodRef, urlRef,
    // requestBodyRef, currentBodyKeyValuePairsRef, // These are now part of bodyManager
    requestNameForSaveRef, activeRequestIdRef,
    // headersRef is part of headersManager
    loadRequest,
    resetEditor
  };
};
