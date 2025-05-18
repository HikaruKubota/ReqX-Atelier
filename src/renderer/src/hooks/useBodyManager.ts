import { useState, useCallback, useRef, useEffect } from 'react';
import type { KeyValuePair } from '../components/BodyEditorKeyValue';

export interface UseBodyManagerReturn {
  currentBodyKeyValuePairs: KeyValuePair[];
  setCurrentBodyKeyValuePairs: (pairs: KeyValuePair[]) => void;
  currentBodyKeyValuePairsRef: React.MutableRefObject<KeyValuePair[]>;
  requestBody: string; // Read-only JSON string derived from key-value pairs
  requestBodyRef: React.MutableRefObject<string>;
  loadBodyKeyValuePairs: (pairs: KeyValuePair[]) => void;
  resetBody: () => void;
}

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
      {} as Record<string, any>,
    );
    return Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '';
  } catch (e) {
    // console.error("Error generating JSON from K-V pairs:", e);
    return ''; // Fallback to empty string on error
  }
};

export const useBodyManager = (): UseBodyManagerReturn => {
  const [currentBodyKeyValuePairsState, setCurrentBodyKeyValuePairsState] = useState<
    KeyValuePair[]
  >([]);
  const currentBodyKeyValuePairsRef = useRef<KeyValuePair[]>(currentBodyKeyValuePairsState);

  const [requestBodyState, setRequestBodyState] = useState<string>('');
  const requestBodyRef = useRef<string>(requestBodyState);

  // Update requestBody (JSON string) whenever currentBodyKeyValuePairsState changes
  useEffect(() => {
    const newJsonBody = generateJsonFromBodyPairs(currentBodyKeyValuePairsState);
    setRequestBodyState(newJsonBody);
    requestBodyRef.current = newJsonBody;
  }, [currentBodyKeyValuePairsState]);

  const setCurrentBodyKeyValuePairs = useCallback((pairs: KeyValuePair[]) => {
    setCurrentBodyKeyValuePairsState(pairs);
    currentBodyKeyValuePairsRef.current = pairs;
  }, []);

  const loadBodyKeyValuePairs = useCallback((pairs: KeyValuePair[]) => {
    // This will also trigger the useEffect to update the JSON string version
    setCurrentBodyKeyValuePairsState(pairs || []);
    currentBodyKeyValuePairsRef.current = pairs || [];
  }, []);

  const resetBody = useCallback(() => {
    setCurrentBodyKeyValuePairsState([]);
    currentBodyKeyValuePairsRef.current = [];
    // The useEffect will then set requestBodyState and requestBodyRef to ''
  }, []);

  return {
    currentBodyKeyValuePairs: currentBodyKeyValuePairsState,
    setCurrentBodyKeyValuePairs,
    currentBodyKeyValuePairsRef,
    requestBody: requestBodyState,
    requestBodyRef,
    loadBodyKeyValuePairs,
    resetBody,
  };
};
