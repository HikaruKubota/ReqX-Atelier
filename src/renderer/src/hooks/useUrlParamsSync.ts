import { useEffect, useRef } from 'react';
import type { KeyValuePair } from '../types';

interface UseUrlParamsSyncProps {
  url: string;
  params: KeyValuePair[];
  onUrlChange: (url: string) => void;
  onParamsChange: (params: KeyValuePair[]) => void;
  skipSync?: boolean;
}

export const useUrlParamsSync = ({
  url,
  params,
  onUrlChange,
  onParamsChange,
  skipSync = false,
}: UseUrlParamsSyncProps) => {
  const isSyncingUrlToParamsRef = useRef(false);
  const isSyncingParamsToUrlRef = useRef(false);
  const lastUrlRef = useRef<string>('');
  const lastParamsJsonRef = useRef<string>('');
  const urlJustChangedRef = useRef(false);

  // Extract params from URL
  const extractParamsFromUrl = (urlString: string): KeyValuePair[] => {
    // Since variable names cannot contain '?', we can safely split by '?'
    const questionIndex = urlString.indexOf('?');
    if (questionIndex === -1) {
      return [];
    }

    const queryString = urlString.substring(questionIndex + 1);
    // Remove hash if present
    const hashIndex = queryString.indexOf('#');
    const cleanQueryString = hashIndex !== -1 ? queryString.substring(0, hashIndex) : queryString;

    if (!cleanQueryString) {
      return [];
    }

    try {
      const searchParams = new URLSearchParams(cleanQueryString);
      const extractedParams: KeyValuePair[] = [];

      searchParams.forEach((value, key) => {
        extractedParams.push({
          id: `param-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          keyName: key,
          value: value,
          enabled: true,
        });
      });

      return extractedParams;
    } catch {
      // If query string parsing fails, return empty array
      return [];
    }
  };

  // Get base URL without query params
  const getBaseUrl = (urlString: string): { base: string; hash: string } => {
    // Since variable names cannot contain '?', we can safely split by '?'
    const questionIndex = urlString.indexOf('?');
    const hashIndex = urlString.indexOf('#');

    let base: string;
    let hash: string = '';

    if (questionIndex === -1 && hashIndex === -1) {
      // No query or hash
      return { base: urlString, hash: '' };
    }

    if (questionIndex !== -1) {
      // Has query string
      base = urlString.substring(0, questionIndex);
      // Extract hash from the remaining part
      const remaining = urlString.substring(questionIndex);
      const hashInRemaining = remaining.indexOf('#');
      if (hashInRemaining !== -1) {
        hash = remaining.substring(hashInRemaining);
      }
    } else {
      // Only has hash
      base = urlString.substring(0, hashIndex);
      hash = urlString.substring(hashIndex);
    }

    return { base, hash };
  };

  // Build URL from params
  const buildUrlFromParams = (baseUrl: string, paramsList: KeyValuePair[]): string => {
    const { base, hash } = getBaseUrl(baseUrl);
    const enabledParams = paramsList.filter((p) => p.enabled && p.keyName);

    if (enabledParams.length === 0) return base + hash;

    const queryString = enabledParams
      .map((p) => `${encodeURIComponent(p.keyName)}=${encodeURIComponent(p.value || '')}`)
      .join('&');

    return `${base}?${queryString}${hash}`;
  };

  // Sync URL changes to params
  useEffect(() => {
    // Skip if syncing is disabled
    if (skipSync) {
      console.log('[Sync] Skipping all sync (skipSync=true)');
      return;
    }

    // Skip if URL hasn't changed
    if (url === lastUrlRef.current) {
      return;
    }

    lastUrlRef.current = url;
    
    // Mark that URL just changed - this will prevent params->URL sync
    urlJustChangedRef.current = true;

    // Skip if we're in the middle of syncing to prevent loops
    if (isSyncingUrlToParamsRef.current) {
      return;
    }
    
    // Skip if this URL change was from params->URL sync
    if (isSyncingParamsToUrlRef.current) {
      return;
    }

    // Extract params from URL
    const extractedParams = extractParamsFromUrl(url);
    
    const extractedJson = JSON.stringify(
      extractedParams
        .map((p) => ({ k: p.keyName, v: p.value }))
        .sort((a, b) => a.k.localeCompare(b.k)),
    );

    // Check if params actually need updating
    const currentJson = JSON.stringify(
      params
        .filter((p) => p.enabled && p.keyName)
        .map((p) => ({ k: p.keyName, v: p.value || '' }))
        .sort((a, b) => a.k.localeCompare(b.k)),
    );
    

    if (extractedJson !== currentJson) {
      isSyncingUrlToParamsRef.current = true;
      onParamsChange(extractedParams);
      lastParamsJsonRef.current = extractedJson;
      // Reset sync flag after a microtask
      Promise.resolve().then(() => {
        isSyncingUrlToParamsRef.current = false;
        // Reset URL changed flag after params have been updated
        urlJustChangedRef.current = false;
      });
    } else {
      // Even if params didn't change, reset the flag
      urlJustChangedRef.current = false;
    }
  }, [url, params, onParamsChange, skipSync]);

  // Sync params changes to URL
  useEffect(() => {
    // Skip if syncing is disabled
    if (skipSync) {
      return;
    }

    // Skip if URL just changed (user is typing in URL field)
    if (urlJustChangedRef.current) {
      return;
    }

    const paramsJson = JSON.stringify(
      params
        .filter((p) => p.enabled && p.keyName)
        .map((p) => ({ k: p.keyName, v: p.value || '' }))
        .sort((a, b) => a.k.localeCompare(b.k)),
    );

    // Skip if params haven't changed
    if (paramsJson === lastParamsJsonRef.current) {
      return;
    }

    lastParamsJsonRef.current = paramsJson;

    // Skip if we're in the middle of syncing to prevent loops
    if (isSyncingParamsToUrlRef.current) {
      return;
    }

    // Build new URL
    const newUrl = buildUrlFromParams(url, params);
    if (newUrl !== url) {
      isSyncingParamsToUrlRef.current = true;
      onUrlChange(newUrl);
      lastUrlRef.current = newUrl;
      // Reset sync flag after a microtask
      Promise.resolve().then(() => {
        isSyncingParamsToUrlRef.current = false;
      });
    }
  }, [params, url, onUrlChange, skipSync]);

  return {
    extractParamsFromUrl,
    buildUrlFromParams,
  };
};
