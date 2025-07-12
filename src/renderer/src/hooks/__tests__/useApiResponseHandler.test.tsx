import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiResponseHandler } from '../useApiResponseHandler';
import { useVariablesStore, type VariablesState } from '../../store/variablesStore';
import type { ApiResult, ApiError } from '../../types';

// Mock the api module
vi.mock('../../api', () => ({
  sendApiRequest: vi.fn(),
}));

// Import after mocking
import { sendApiRequest } from '../../api';

// Mock the variables store
vi.mock('../../store/variablesStore');

describe('useApiResponseHandler', () => {
  const mockSendApiRequest = vi.mocked(sendApiRequest);
  const mockGetResolvedVariables = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the entire useVariablesStore hook
    vi.mocked(useVariablesStore).mockImplementation(
      (selector?: (state: VariablesState) => unknown) => {
        // If a selector is provided, call it with our mock state
        if (typeof selector === 'function') {
          const mockState = {
            globalVariables: {},
            environments: [],
            activeEnvironmentId: 'development',
            setActiveEnvironment: vi.fn(),
            addGlobalVariable: vi.fn(),
            updateGlobalVariable: vi.fn(),
            deleteGlobalVariable: vi.fn(),
            addEnvironmentVariable: vi.fn(),
            updateEnvironmentVariable: vi.fn(),
            deleteEnvironmentVariable: vi.fn(),
            addEnvironment: vi.fn(),
            updateEnvironment: vi.fn(),
            deleteEnvironment: vi.fn(),
            getResolvedVariables: mockGetResolvedVariables,
            resolveVariable: vi.fn(),
          };
          return selector(mockState);
        }
        // Otherwise return the mock function directly
        return mockGetResolvedVariables;
      },
    );
    mockGetResolvedVariables.mockReturnValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have initial state with all values null/false', () => {
      const { result } = renderHook(() => useApiResponseHandler());

      expect(result.current.response).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.responseTime).toBeNull();
    });
  });

  describe('executeRequest', () => {
    it('should handle successful GET request', async () => {
      const mockResponse: ApiResult = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { message: 'Success' },
      };
      mockSendApiRequest.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com/data');
      });

      expect(result.current.response).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle successful POST request with body', async () => {
      const mockResponse: ApiResult = {
        status: 201,
        headers: { 'content-type': 'application/json' },
        data: { id: 1, name: 'Created' },
      };
      mockSendApiRequest.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useApiResponseHandler());
      const body = JSON.stringify({ name: 'Test' });
      const headers = { 'Content-Type': 'application/json' };

      await act(async () => {
        await result.current.executeRequest(
          'POST',
          'https://api.example.com/create',
          body,
          headers,
        );
      });

      expect(mockSendApiRequest).toHaveBeenCalledWith(
        'POST',
        'https://api.example.com/create',
        body,
        headers,
      );
      expect(result.current.response).toEqual(mockResponse);
    });

    it('should not send body for GET and HEAD requests', async () => {
      const mockResponse: ApiResult = {
        status: 200,
        headers: {},
        data: null,
      };
      mockSendApiRequest.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com', 'ignored body');
      });

      expect(mockSendApiRequest).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com',
        undefined,
        undefined,
      );
    });

    it('should handle API error responses', async () => {
      const errorResponse: ApiError = {
        isError: true,
        message: 'Bad Request',
        status: 400,
        data: { error: 'Invalid input' },
      };
      mockSendApiRequest.mockResolvedValueOnce(errorResponse);

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('POST', 'https://api.example.com/error');
      });

      expect(result.current.response).toBeNull();
      expect(result.current.error).toEqual(errorResponse);
      expect(result.current.loading).toBe(false);
    });

    it('should handle non-2xx status codes as errors', async () => {
      const response: ApiResult = {
        status: 404,
        headers: {},
        data: { message: 'Not Found' },
      };
      mockSendApiRequest.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com/notfound');
      });

      expect(result.current.response).toBeNull();
      expect(result.current.error).toMatchObject({
        message: 'API Error: Request failed with status code 404',
        status: 404,
        responseData: { message: 'Not Found' },
        isApiError: true,
      });
    });

    it('should handle exceptions during request', async () => {
      const error = new Error('Network error');
      mockSendApiRequest.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com/error');
      });

      expect(result.current.response).toBeNull();
      expect(result.current.error).toEqual({
        message: 'Network error',
        isError: true,
        type: 'ApplicationError',
      });
    });

    it('should set loading state during request', async () => {
      let resolvePromise: (value: ApiResult) => void;
      const promise = new Promise<ApiResult>((resolve) => {
        resolvePromise = resolve;
      });
      mockSendApiRequest.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useApiResponseHandler());

      act(() => {
        result.current.executeRequest('GET', 'https://api.example.com/slow');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!({ status: 200, headers: {}, data: {} });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Variable Resolution', () => {
    it('should resolve variables in URL', async () => {
      mockGetResolvedVariables.mockReturnValue({
        BASE_URL: { name: 'BASE_URL', value: 'https://api.example.com', enabled: true },
        USER_ID: { name: 'USER_ID', value: '123', enabled: true },
      });
      mockSendApiRequest.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: {},
      });

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', '${BASE_URL}/users/${USER_ID}');
      });

      expect(mockSendApiRequest).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com/users/123',
        undefined,
        undefined,
      );
    });

    it('should resolve variables in request body', async () => {
      mockGetResolvedVariables.mockReturnValue({
        API_KEY: { name: 'API_KEY', value: 'secret-key', enabled: true },
        USERNAME: { name: 'USERNAME', value: 'test-user', enabled: true },
      });
      mockSendApiRequest.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: {},
      });

      const { result } = renderHook(() => useApiResponseHandler());
      const body = JSON.stringify({
        apiKey: '${API_KEY}',
        username: '${USERNAME}',
      });

      await act(async () => {
        await result.current.executeRequest('POST', 'https://api.example.com/auth', body);
      });

      const expectedBody = JSON.stringify({
        apiKey: 'secret-key',
        username: 'test-user',
      });
      expect(mockSendApiRequest).toHaveBeenCalledWith(
        'POST',
        'https://api.example.com/auth',
        expectedBody,
        undefined,
      );
    });

    it('should resolve variables in headers', async () => {
      mockGetResolvedVariables.mockReturnValue({
        AUTH_TOKEN: { name: 'AUTH_TOKEN', value: 'Bearer xyz123', enabled: true },
        API_VERSION: { name: 'API_VERSION', value: 'v2', enabled: true },
      });
      mockSendApiRequest.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: {},
      });

      const { result } = renderHook(() => useApiResponseHandler());
      const headers = {
        Authorization: '${AUTH_TOKEN}',
        'X-API-Version': '${API_VERSION}',
      };

      await act(async () => {
        await result.current.executeRequest(
          'GET',
          'https://api.example.com/data',
          undefined,
          headers,
        );
      });

      expect(mockSendApiRequest).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com/data',
        undefined,
        {
          Authorization: 'Bearer xyz123',
          'X-API-Version': 'v2',
        },
      );
    });

    it('should keep unresolved variables as-is', async () => {
      mockGetResolvedVariables.mockReturnValue({
        EXISTING_VAR: { name: 'EXISTING_VAR', value: 'exists', enabled: true },
      });
      mockSendApiRequest.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: {},
      });

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', '${EXISTING_VAR}/${NON_EXISTENT_VAR}');
      });

      expect(mockSendApiRequest).toHaveBeenCalledWith(
        'GET',
        'exists/${NON_EXISTENT_VAR}',
        undefined,
        undefined,
      );
    });
  });

  describe('resetApiResponse', () => {
    it('should reset all state to initial values', async () => {
      // First, make a request to populate state
      mockSendApiRequest.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { test: true },
      });

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com/test');
      });

      expect(result.current.response).not.toBeNull();
      expect(result.current.responseTime).not.toBeNull();

      // Reset the state
      act(() => {
        result.current.resetApiResponse();
      });

      expect(result.current.response).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.responseTime).toBeNull();
    });
  });

  describe('setApiResponseState', () => {
    it('should set custom state values', () => {
      const { result } = renderHook(() => useApiResponseHandler());

      const customState = {
        response: { status: 200, headers: {}, data: { custom: true } },
        error: null,
        responseTime: 150,
      };

      act(() => {
        result.current.setApiResponseState(customState);
      });

      expect(result.current.response).toEqual(customState.response);
      expect(result.current.error).toEqual(customState.error);
      expect(result.current.responseTime).toEqual(customState.responseTime);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Response Time Tracking', () => {
    it('should track response time for successful requests', async () => {
      mockSendApiRequest.mockImplementation(async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { status: 200, headers: {}, data: {} };
      });

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com/test');
      });

      expect(result.current.responseTime).toBeGreaterThanOrEqual(50);
    });

    it('should track response time for failed requests', async () => {
      mockSendApiRequest.mockImplementation(async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 30));
        throw new Error('Request failed');
      });

      const { result } = renderHook(() => useApiResponseHandler());

      await act(async () => {
        await result.current.executeRequest('GET', 'https://api.example.com/test');
      });

      expect(result.current.responseTime).toBeGreaterThanOrEqual(30);
    });
  });
});
