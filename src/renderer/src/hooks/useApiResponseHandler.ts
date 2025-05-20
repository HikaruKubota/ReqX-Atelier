import { useState, useCallback } from 'react';
import { sendApiRequest } from '../api';
import type { ApiResult, ApiError, ApiResponseHandler } from '../types';

export const useApiResponseHandler = (): ApiResponseHandler => {
  const [response, setResponse] = useState<ApiResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const executeRequest = useCallback(
    async (method: string, url: string, body?: string, headers?: Record<string, string>) => {
      setLoading(true);
      setError(null);
      setResponse(null);
      setResponseTime(null);
      const start = Date.now();
      try {
        const result = await sendApiRequest(
          method,
          url,
          method !== 'GET' && method !== 'HEAD' ? body : undefined,
          headers,
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

  return { response, error, loading, responseTime, executeRequest, resetApiResponse };
};
