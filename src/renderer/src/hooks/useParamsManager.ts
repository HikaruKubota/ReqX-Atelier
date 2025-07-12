import { useState, useCallback, useEffect } from 'react';
import { useLatest } from './useLatest';
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
  const paramsRef = useLatest(paramsState);

  const [queryStringState, setQueryStringState] = useState('');
  const queryStringRef = useLatest(queryStringState);

  useEffect(() => {
    const q = paramsState
      .filter((p) => p.enabled && p.keyName.trim() !== '')
      .map((p) => `${p.keyName}=${p.value}`)
      .join('&');
    setQueryStringState(q);
  }, [paramsState]);

  const setParams = useCallback((pairs: KeyValuePair[]) => {
    setParamsState(pairs);
  }, []);

  const loadParams = useCallback((pairs: KeyValuePair[]) => {
    setParamsState(pairs || []);
  }, []);

  const resetParams = useCallback(() => {
    setParamsState([]);
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
