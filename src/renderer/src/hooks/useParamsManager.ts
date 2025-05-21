import { useState, useCallback, useRef, useEffect } from 'react';
import type { KeyValuePair, UseParamsManagerReturn } from '../types';

const generateQueryFromPairs = (pairs: KeyValuePair[]): string => {
  const parts = pairs
    .filter((p) => p.enabled && p.keyName.trim() !== '')
    .map((p) => `${encodeURIComponent(p.keyName)}=${encodeURIComponent(p.value)}`);
  return parts.join('&');
};

export const useParamsManager = (): UseParamsManagerReturn => {
  const [paramsState, setParamsState] = useState<KeyValuePair[]>([]);
  const paramsRef = useRef<KeyValuePair[]>(paramsState);

  const [queryStringState, setQueryStringState] = useState('');
  const queryStringRef = useRef(queryStringState);

  useEffect(() => {
    const qs = generateQueryFromPairs(paramsState);
    setQueryStringState(qs);
    queryStringRef.current = qs;
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
