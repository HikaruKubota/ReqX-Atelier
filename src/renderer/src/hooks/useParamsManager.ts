import { useState, useCallback, useRef, useMemo } from 'react';
import type { KeyValuePair } from '../types';

export interface UseParamsManagerReturn {
  params: KeyValuePair[];
  setParams: (pairs: KeyValuePair[]) => void;
  paramsRef: React.MutableRefObject<KeyValuePair[]>;
  queryString: string;
  queryStringRef: React.MutableRefObject<string>;
  loadParams: (pairs: KeyValuePair[]) => void;
  resetParams: () => void;
}

export const useParamsManager = (): UseParamsManagerReturn => {
  const [paramsState, setParamsState] = useState<KeyValuePair[]>([]);
  const paramsRef = useRef<KeyValuePair[]>(paramsState);

  // Use useMemo to compute query string synchronously
  const queryString = useMemo(() => {
    return paramsState
      .filter((p) => p.enabled && p.keyName.trim() !== '')
      .map((p) => `${encodeURIComponent(p.keyName)}=${encodeURIComponent(p.value)}`)
      .join('&');
  }, [paramsState]);
  
  const queryStringRef = useRef(queryString);
  queryStringRef.current = queryString;

  const setParams = useCallback((pairs: KeyValuePair[]) => {
    setParamsState(pairs);
    paramsRef.current = pairs;
  }, []);

  const loadParams = useCallback((pairs: KeyValuePair[]) => {
    setParamsState(pairs || []);
    paramsRef.current = pairs || [];
  }, []);

  const resetParams = useCallback(() => {
    setParamsState([]);
    paramsRef.current = [];
  }, []);

  return {
    params: paramsState,
    setParams,
    paramsRef,
    queryString,
    queryStringRef,
    loadParams,
    resetParams,
  };
};
