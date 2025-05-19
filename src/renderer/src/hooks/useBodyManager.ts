import { useState, useCallback, useRef, useEffect } from 'react';
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
  const bodyRef = useRef<KeyValuePair[]>(bodyState);

  const [requestBodyState, setRequestBodyState] = useState<string>('');
  const requestBodyRef = useRef<string>(requestBodyState);

  // Update requestBody (JSON string) whenever bodyState changes
  useEffect(() => {
    const newJsonBody = generateJsonFromBodyPairs(bodyState);
    setRequestBodyState(newJsonBody);
    requestBodyRef.current = newJsonBody;
  }, [bodyState]);

  const setBody = useCallback((pairs: KeyValuePair[]) => {
    setBodyState(pairs);
    bodyRef.current = pairs;
  }, []);

  const loadBody = useCallback((pairs: KeyValuePair[]) => {
    // This will also trigger the useEffect to update the JSON string version
    setBodyState(pairs || []);
    bodyRef.current = pairs || [];
  }, []);

  const resetBody = useCallback(() => {
    setBodyState([]);
    bodyRef.current = [];
    // The useEffect will then set requestBodyState and requestBodyRef to ''
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
