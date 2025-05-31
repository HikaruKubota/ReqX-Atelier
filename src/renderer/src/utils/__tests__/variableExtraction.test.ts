import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractVariablesFromResponse, applyExtractedVariables } from '../variableExtraction';
import type { ApiResult, VariableExtraction } from '../../types';
import { useVariablesStore } from '../../store/variablesStore';

// Mock the store
vi.mock('../../store/variablesStore');

describe('variableExtraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractVariablesFromResponse', () => {
    it('should extract variables from JSON response body', () => {
      const response: ApiResult = {
        status: 200,
        data: {
          token: 'abc123',
          user: {
            id: 'user456',
            name: 'John Doe'
          }
        },
        headers: {}
      };

      const variableExtraction: VariableExtraction = {
        enabled: true,
        extractionRules: [
          {
            id: '1',
            source: 'body-json',
            path: '$.token',
            variableName: 'authToken',
            scope: 'environment',
            enabled: true
          },
          {
            id: '2',
            source: 'body-json',
            path: '$.user.id',
            variableName: 'userId',
            scope: 'global',
            enabled: true
          }
        ],
        customScript: ''
      };

      const results = extractVariablesFromResponse(response, variableExtraction);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        variableName: 'authToken',
        value: 'abc123',
        scope: 'environment',
        success: true
      });
      expect(results[1]).toEqual({
        variableName: 'userId',
        value: 'user456',
        scope: 'global',
        success: true
      });
    });

    it('should handle missing paths gracefully', () => {
      const response: ApiResult = {
        status: 200,
        data: { token: 'abc123' },
        headers: {}
      };

      const variableExtraction: VariableExtraction = {
        enabled: true,
        extractionRules: [
          {
            id: '1',
            source: 'body-json',
            path: '$.missingField',
            variableName: 'testVar',
            scope: 'environment',
            enabled: true
          }
        ],
        customScript: ''
      };

      const results = extractVariablesFromResponse(response, variableExtraction);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('No value found at path');
    });

    it('should extract from headers', () => {
      const response: ApiResult = {
        status: 200,
        data: {},
        headers: {
          'X-Auth-Token': 'bearer123',
          'Content-Type': 'application/json'
        }
      };

      const variableExtraction: VariableExtraction = {
        enabled: true,
        extractionRules: [
          {
            id: '1',
            source: 'header',
            headerName: 'X-Auth-Token',
            variableName: 'authHeader',
            scope: 'environment',
            enabled: true
          }
        ],
        customScript: ''
      };

      const results = extractVariablesFromResponse(response, variableExtraction);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        variableName: 'authHeader',
        value: 'bearer123',
        scope: 'environment',
        success: true
      });
    });

    it('should skip disabled rules', () => {
      const response: ApiResult = {
        status: 200,
        data: { token: 'abc123' },
        headers: {}
      };

      const variableExtraction: VariableExtraction = {
        enabled: true,
        extractionRules: [
          {
            id: '1',
            source: 'body-json',
            path: '$.token',
            variableName: 'authToken',
            scope: 'environment',
            enabled: false
          }
        ],
        customScript: ''
      };

      const results = extractVariablesFromResponse(response, variableExtraction);

      expect(results).toHaveLength(0);
    });
  });

  describe('applyExtractedVariables', () => {
    it('should apply extracted variables to the store', () => {
      const mockStore = {
        globalVariables: {},
        activeEnvironmentId: 'dev',
        environments: [
          { id: 'dev', name: 'Development', variables: {} }
        ],
        addGlobalVariable: vi.fn(),
        updateGlobalVariable: vi.fn(),
        addEnvironmentVariable: vi.fn(),
        updateEnvironmentVariable: vi.fn()
      };

      (useVariablesStore.getState as ReturnType<typeof vi.fn>).mockReturnValue(mockStore);

      const results = [
        {
          variableName: 'token',
          value: 'abc123',
          scope: 'environment' as const,
          success: true
        },
        {
          variableName: 'apiUrl',
          value: 'https://api.example.com',
          scope: 'global' as const,
          success: true
        }
      ];

      applyExtractedVariables(results);

      expect(mockStore.addEnvironmentVariable).toHaveBeenCalledWith('dev', {
        name: 'token',
        value: 'abc123',
        enabled: true,
        secure: false
      });

      expect(mockStore.addGlobalVariable).toHaveBeenCalledWith({
        name: 'apiUrl',
        value: 'https://api.example.com',
        enabled: true,
        secure: false
      });
    });
  });
});