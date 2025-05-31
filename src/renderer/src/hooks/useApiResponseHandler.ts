import { useState, useCallback } from 'react';
import { sendApiRequest } from '../api';
import type { ApiResult, ApiError, ApiResponseHandler } from '../types';
import { useVariablesStore } from '../store/variablesStore';

export const useApiResponseHandler = (): ApiResponseHandler => {
  const [response, setResponse] = useState<ApiResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const getResolvedVariables = useVariablesStore((state) => state.getResolvedVariables);

  // Helper function to resolve variables in a string
  const resolveVariables = (str: string): string => {
    const variables = getResolvedVariables();
    return str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const variable = variables[varName];
      return variable ? variable.value : match;
    });
  };

  // Helper function to resolve variables in headers
  const resolveHeaderVariables = (headers?: Record<string, string>): Record<string, string> | undefined => {
    if (!headers) return headers;
    
    const resolved: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      resolved[key] = resolveVariables(value);
    });
    return resolved;
  };

  const executeRequest = useCallback(
    async (method: string, url: string, body?: string, headers?: Record<string, string>) => {
      setLoading(true);
      setError(null);
      setResponse(null);
      setResponseTime(null);
      const start = Date.now();
      
      // Resolve variables in URL, body, and headers
      const resolvedUrl = resolveVariables(url);
      const resolvedBody = body ? resolveVariables(body) : body;
      const resolvedHeaders = resolveHeaderVariables(headers);
      
      try {
        const result = await sendApiRequest(
          method,
          resolvedUrl,
          method !== 'GET' && method !== 'HEAD' ? resolvedBody : undefined,
          resolvedHeaders,
        );
        if (result.isError) {
          setError(result as ApiError);
        } else if (result.status && result.status >= 200 && result.status < 300) {
          setResponse(result);
        } else {
          setError({
            message: `API Error: Request failed with status code ${result.status || 'unknown'}`,
            status: result.status,
            responseData: result.data,
            headers: result.headers,
            isApiError: true,
          });
        }
        setResponseTime(Date.now() - start);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError({ message, isError: true, type: 'ApplicationError' });
        setResponseTime(Date.now() - start);
      }
      setLoading(false);
    },
    [],
  );

  const resetApiResponse = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
    setResponseTime(null);
  }, []);

  const setApiResponseState = useCallback(
    (state: {
      response: ApiResult | null;
      error: ApiError | null;
      responseTime: number | null;
    }) => {
      setResponse(state.response);
      setError(state.error);
      setResponseTime(state.responseTime);
      setLoading(false);
    },
    [],
  );

  return {
    response,
    error,
    loading,
    responseTime,
    executeRequest,
    resetApiResponse,
    setApiResponseState,
  };
};
