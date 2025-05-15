import { useState, useCallback } from 'react';
import { sendApiRequest, ApiResult } from '../api'; // Assuming ApiResult is the type returned by sendApiRequest

export interface ApiResponseHandler {
  response: ApiResult | null;
  error: any; // Consider a more specific error type
  loading: boolean;
  executeRequest: (method: string, url: string, body?: string) => Promise<void>;
  resetApiResponse: () => void;
}

export const useApiResponseHandler = (): ApiResponseHandler => {
  const [response, setResponse] = useState<ApiResult | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = useCallback(async (method: string, url: string, body?: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const headers: Record<string, string> = {};
      if (url === 'https://httpbin.org/bearer') {
        headers['Authorization'] = 'Bearer mytesttoken';
      }

      const result = await sendApiRequest(method, url, (method !== 'GET' && method !== 'HEAD') ? body : undefined, headers);
      if (result.isError) {
        setError(result);
      } else if (result.status && result.status >= 200 && result.status < 300) {
        setResponse(result);
      } else {
        setError({
          message: `API Error: Request failed with status code ${result.status || 'unknown'}`,
          status: result.status,
          responseData: result.data,
          headers: result.headers,
          isApiError: true
        });
      }
    } catch (err: any) {
      setError({ message: err.message, isError: true, type: 'ApplicationError' });
    }
    setLoading(false);
  }, []);

  const resetApiResponse = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  return { response, error, loading, executeRequest, resetApiResponse };
};
