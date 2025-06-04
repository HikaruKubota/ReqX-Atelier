import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ApiResult, ApiError } from '../types';

// Mock electron IPC
const mockInvoke = vi.fn();

// Mock window.require before importing the module
Object.defineProperty(window, 'require', {
  writable: true,
  value: vi.fn(() => ({
    ipcRenderer: {
      invoke: mockInvoke,
    },
  })),
});

// Import after mocking window.require
const { sendApiRequest } = await import('../api');

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.log mock
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendApiRequest', () => {
    it('should send GET request without body', async () => {
      const mockResponse: ApiResult = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { message: 'success' },
      };
      mockInvoke.mockResolvedValueOnce(mockResponse);

      const result = await sendApiRequest('GET', 'https://api.example.com/users');

      expect(mockInvoke).toHaveBeenCalledWith('send-api-request', {
        method: 'GET',
        url: 'https://api.example.com/users',
        data: null,
        headers: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send POST request with JSON body', async () => {
      const mockResponse: ApiResult = {
        status: 201,
        headers: { 'content-type': 'application/json' },
        data: { id: 1, name: 'Test User' },
      };
      mockInvoke.mockResolvedValueOnce(mockResponse);

      const body = JSON.stringify({ name: 'Test User' });
      const headers = { 'Content-Type': 'application/json' };

      const result = await sendApiRequest('POST', 'https://api.example.com/users', body, headers);

      expect(mockInvoke).toHaveBeenCalledWith('send-api-request', {
        method: 'POST',
        url: 'https://api.example.com/users',
        data: { name: 'Test User' },
        headers,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid JSON body', async () => {
      const invalidJson = '{ invalid json }';

      await expect(
        sendApiRequest('POST', 'https://api.example.com/users', invalidJson),
      ).rejects.toThrow('Invalid JSON body');

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('should handle empty body', async () => {
      const mockResponse: ApiResult = {
        status: 200,
        headers: {},
        data: null,
      };
      mockInvoke.mockResolvedValueOnce(mockResponse);

      const result = await sendApiRequest('DELETE', 'https://api.example.com/users/1', '');

      expect(mockInvoke).toHaveBeenCalledWith('send-api-request', {
        method: 'DELETE',
        url: 'https://api.example.com/users/1',
        data: null,
        headers: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should log request details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockResponse: ApiResult = {
        status: 200,
        headers: {},
        data: {},
      };
      mockInvoke.mockResolvedValueOnce(mockResponse);

      const body = JSON.stringify({ test: true });
      const headers = { Authorization: 'Bearer token' };

      await sendApiRequest('PUT', 'https://api.example.com/test', body, headers);

      expect(console.log).toHaveBeenCalledWith('[sendApiRequest]', {
        method: 'PUT',
        url: 'https://api.example.com/test',
        data: { test: true },
        headers,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle IPC errors', async () => {
      const errorMessage = 'IPC communication failed';
      mockInvoke.mockRejectedValueOnce(new Error(errorMessage));

      await expect(sendApiRequest('GET', 'https://api.example.com/error')).rejects.toThrow(
        errorMessage,
      );
    });

    it('should handle network errors from main process', async () => {
      const networkError: ApiError = {
        isError: true,
        message: 'Network request failed',
      };
      mockInvoke.mockResolvedValueOnce(networkError);

      const result = await sendApiRequest('GET', 'https://api.example.com/offline');

      expect(result).toEqual(networkError);
    });
  });
});