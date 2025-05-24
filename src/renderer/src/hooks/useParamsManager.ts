import { useState, useCallback, useRef, useEffect } from 'react';
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

  const [queryStringState, setQueryStringState] = useState('');
  const queryStringRef = useRef('');

  useEffect(() => {
    const q = paramsState
      .filter((p) => p.enabled && p.keyName.trim() !== '')
      .map((p) => `${(p.keyName)}=${(p.value)}`)
      .join('&');
    setQueryStringState(q);
    queryStringRef.current = q;
  }, [paramsState]);

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
    queryString: queryStringState,
    queryStringRef,
    loadParams,
    resetParams,
  };
};
