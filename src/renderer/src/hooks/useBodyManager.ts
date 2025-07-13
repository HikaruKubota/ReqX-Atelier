import { useState, useCallback, useEffect, useRef } from 'react';
import { useLatest } from './useLatest';
import type { KeyValuePair, UseBodyManagerReturn } from '../types';

const generateJsonFromBodyPairs = (pairs: KeyValuePair[]): string => {
  if (pairs.length === 0) return '';
  try {
    const jsonObject = pairs.reduce(
      (obj, pair) => {
        if (pair.enabled && pair.keyName.trim() !== '') {
          try {
            obj[pair.keyName] = JSON.parse(pair.value);
          } catch {
            obj[pair.keyName] = pair.value; // Store as string if JSON.parse fails
          }
        }
        return obj;
      },
      {} as Record<string, unknown>,
    );
    return Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '';
  } catch {
    // console.error("Error generating JSON from K-V pairs:", e);
    return ''; // Fallback to empty string on error
  }
};

export const useBodyManager = (): UseBodyManagerReturn => {
  const [bodyState, setBodyState] = useState<KeyValuePair[]>([]);
  const bodyRef = useLatest(bodyState);

  const [requestBodyState, setRequestBodyState] = useState<string>('');
  const requestBodyRef = useLatest(requestBodyState);

  // Update requestBody (JSON string) whenever bodyState changes
  const lastBodyStateRef = useRef<KeyValuePair[]>([]);
  useEffect(() => {
    // Avoid unnecessary updates by comparing with previous bodyState
    if (JSON.stringify(bodyState) === JSON.stringify(lastBodyStateRef.current)) {
      return;
    }
    lastBodyStateRef.current = bodyState;

    const newJsonBody = generateJsonFromBodyPairs(bodyState);
    setRequestBodyState(newJsonBody);
  }, [bodyState]);

  const setBody = useCallback((pairs: KeyValuePair[]) => {
    setBodyState(pairs);
  }, []);

  const loadBody = useCallback((pairs: KeyValuePair[]) => {
    // This will also trigger the useEffect to update the JSON string version
    setBodyState(pairs || []);
  }, []);

  const resetBody = useCallback(() => {
    setBodyState([]);
    // The useEffect will then set requestBodyState to ''
  }, []);

  return {
    body: bodyState,
    setBody,
    bodyRef,
    requestBody: requestBodyState,
    requestBodyRef,
    loadBody,
    resetBody,
  };
};
