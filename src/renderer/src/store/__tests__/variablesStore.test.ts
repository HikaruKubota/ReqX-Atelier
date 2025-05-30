import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useVariablesStore } from '../variablesStore';

describe('variablesStore', () => {
  beforeEach(() => {
    // Reset store between tests
    const { result } = renderHook(() => useVariablesStore());
    act(() => {
      // Clear all variables
      result.current.variables = {
        global: [],
        collections: {},
        folders: {},
        requests: {},
      };
    });
  });

  describe('Variable Management', () => {
    it('should add a global variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addVariable('global', null, {
          name: 'domain',
          value: 'https://api.example.com',
          enabled: true,
        });
      });

      const globalVars = result.current.getVariables('global');
      expect(globalVars).toHaveLength(1);
      expect(globalVars[0].name).toBe('domain');
      expect(globalVars[0].value).toBe('https://api.example.com');
      expect(globalVars[0].enabled).toBe(true);
    });

    it('should add a folder variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addVariable('folders', 'folder-1', {
          name: 'apiKey',
          value: 'secret-key',
          enabled: true,
        });
      });

      const folderVars = result.current.getVariables('folders', 'folder-1');
      expect(folderVars).toHaveLength(1);
      expect(folderVars[0].name).toBe('apiKey');
      expect(folderVars[0].value).toBe('secret-key');
    });

    it('should update a variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      let varId: string;
      act(() => {
        varId = result.current.addVariable('global', null, {
          name: 'domain',
          value: 'https://api.example.com',
          enabled: true,
        });
      });

      act(() => {
        result.current.updateVariable('global', null, varId, {
          value: 'https://api.production.com',
        });
      });

      const globalVars = result.current.getVariables('global');
      expect(globalVars[0].value).toBe('https://api.production.com');
    });

    it('should delete a variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      let varId: string;
      act(() => {
        varId = result.current.addVariable('global', null, {
          name: 'domain',
          value: 'https://api.example.com',
          enabled: true,
        });
      });

      act(() => {
        result.current.deleteVariable('global', null, varId);
      });

      const globalVars = result.current.getVariables('global');
      expect(globalVars).toHaveLength(0);
    });
  });

  describe('Variable Resolution', () => {
    it('should resolve variables in text', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addVariable('global', null, {
          name: 'domain',
          value: 'https://api.example.com',
          enabled: true,
        });
        result.current.addVariable('global', null, {
          name: 'version',
          value: 'v1',
          enabled: true,
        });
      });

      const resolved = result.current.resolveVariables(
        '${domain}/${version}/users',
        {},
      );

      expect(resolved).toBe('https://api.example.com/v1/users');
    });

    it('should respect variable scope priority', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        // Global variable
        result.current.addVariable('global', null, {
          name: 'env',
          value: 'global',
          enabled: true,
        });
        
        // Folder variable (should override global)
        result.current.addVariable('folders', 'folder-1', {
          name: 'env',
          value: 'folder',
          enabled: true,
        });
      });

      const resolved = result.current.resolveVariables(
        'Environment: ${env}',
        { folderId: 'folder-1' },
      );

      expect(resolved).toBe('Environment: folder');
    });

    it('should respect folder hierarchy priority (child overrides parent)', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        // Global variable
        result.current.addVariable('global', null, {
          name: 'domain',
          value: 'global.example.com',
          enabled: true,
        });
        
        // Parent folder variable (should override global)
        result.current.addVariable('folders', 'parent-folder', {
          name: 'domain',
          value: 'parent.example.com',
          enabled: true,
        });

        // Child folder variable (should override parent)
        result.current.addVariable('folders', 'child-folder', {
          name: 'domain',
          value: 'child.example.com',
          enabled: true,
        });
      });

      const resolved = result.current.resolveVariables(
        'API: ${domain}',
        { 
          folderId: 'child-folder',
          folderHierarchy: ['child-folder', 'parent-folder'] // child to root order
        },
      );

      expect(resolved).toBe('API: child.example.com');
    });

    it('should not resolve disabled variables', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addVariable('global', null, {
          name: 'domain',
          value: 'https://api.example.com',
          enabled: false,
        });
      });

      const resolved = result.current.resolveVariables(
        '${domain}/users',
        {},
      );

      expect(resolved).toBe('${domain}/users');
    });

    it('should detect undefined variables', () => {
      const { result } = renderHook(() => useVariablesStore());

      const undefinedVars = result.current.getUndefinedVariables(
        '${domain}/${version}/users/${id}',
        {},
      );

      expect(undefinedVars).toEqual(['domain', 'version', 'id']);
    });
  });

  describe('Variable Validation', () => {
    it('should validate variable names', () => {
      const { result } = renderHook(() => useVariablesStore());

      expect(result.current.validateVariableName('validName')).toBe(true);
      expect(result.current.validateVariableName('_validName')).toBe(true);
      expect(result.current.validateVariableName('valid_name_123')).toBe(true);
      expect(result.current.validateVariableName('123invalid')).toBe(false);
      expect(result.current.validateVariableName('invalid-name')).toBe(false);
      expect(result.current.validateVariableName('invalid name')).toBe(false);
      expect(result.current.validateVariableName('')).toBe(false);
    });
  });
});