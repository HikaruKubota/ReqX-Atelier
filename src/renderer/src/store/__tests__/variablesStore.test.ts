import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useVariablesStore } from '../variablesStore';
import type { Variable, Environment } from '../variablesStore';

describe('variablesStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useVariablesStore.setState({
      globalVariables: {},
      environments: [
        { id: 'development', name: 'Development', variables: {} },
        { id: 'staging', name: 'Staging', variables: {} },
        { id: 'production', name: 'Production', variables: {} },
      ],
      activeEnvironmentId: 'development',
    });
  });

  describe('Global Variables', () => {
    it('should add a global variable', () => {
      const { result } = renderHook(() => useVariablesStore());
      const variable: Variable = {
        name: 'API_KEY',
        value: '12345',
        enabled: true,
        secure: true,
      };

      act(() => {
        result.current.addGlobalVariable(variable);
      });

      expect(result.current.globalVariables.API_KEY).toEqual(variable);
    });

    it('should update a global variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      // Add initial variable
      act(() => {
        result.current.addGlobalVariable({
          name: 'API_URL',
          value: 'https://api.example.com',
          enabled: true,
        });
      });

      // Update the variable
      act(() => {
        result.current.updateGlobalVariable('API_URL', {
          value: 'https://api-v2.example.com',
          enabled: false,
        });
      });

      expect(result.current.globalVariables.API_URL).toEqual({
        name: 'API_URL',
        value: 'https://api-v2.example.com',
        enabled: false,
      });
    });

    it('should delete a global variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      // Add variables
      act(() => {
        result.current.addGlobalVariable({
          name: 'VAR1',
          value: 'value1',
          enabled: true,
        });
        result.current.addGlobalVariable({
          name: 'VAR2',
          value: 'value2',
          enabled: true,
        });
      });

      // Delete one variable
      act(() => {
        result.current.deleteGlobalVariable('VAR1');
      });

      expect(result.current.globalVariables.VAR1).toBeUndefined();
      expect(result.current.globalVariables.VAR2).toBeDefined();
    });
  });

  describe('Environment Variables', () => {
    it('should add an environment variable', () => {
      const { result } = renderHook(() => useVariablesStore());
      const variable: Variable = {
        name: 'DB_HOST',
        value: 'localhost',
        enabled: true,
      };

      act(() => {
        result.current.addEnvironmentVariable('development', variable);
      });

      const devEnv = result.current.environments.find((env) => env.id === 'development');
      expect(devEnv?.variables.DB_HOST).toEqual(variable);
    });

    it('should update an environment variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      // Add initial variable
      act(() => {
        result.current.addEnvironmentVariable('staging', {
          name: 'API_URL',
          value: 'https://staging.api.com',
          enabled: true,
        });
      });

      // Update the variable
      act(() => {
        result.current.updateEnvironmentVariable('staging', 'API_URL', {
          value: 'https://staging-v2.api.com',
          secure: true,
        });
      });

      const stagingEnv = result.current.environments.find((env) => env.id === 'staging');
      expect(stagingEnv?.variables.API_URL).toEqual({
        name: 'API_URL',
        value: 'https://staging-v2.api.com',
        enabled: true,
        secure: true,
      });
    });

    it('should delete an environment variable', () => {
      const { result } = renderHook(() => useVariablesStore());

      // Add variables
      act(() => {
        result.current.addEnvironmentVariable('production', {
          name: 'SECRET_KEY',
          value: 'prod-secret',
          enabled: true,
          secure: true,
        });
        result.current.addEnvironmentVariable('production', {
          name: 'API_URL',
          value: 'https://api.prod.com',
          enabled: true,
        });
      });

      // Delete one variable
      act(() => {
        result.current.deleteEnvironmentVariable('production', 'SECRET_KEY');
      });

      const prodEnv = result.current.environments.find((env) => env.id === 'production');
      expect(prodEnv?.variables.SECRET_KEY).toBeUndefined();
      expect(prodEnv?.variables.API_URL).toBeDefined();
    });
  });

  describe('Environment Management', () => {
    it('should add a new environment', () => {
      const { result } = renderHook(() => useVariablesStore());
      const newEnv: Environment = {
        id: 'testing',
        name: 'Testing',
        variables: {
          TEST_VAR: {
            name: 'TEST_VAR',
            value: 'test-value',
            enabled: true,
          },
        },
      };

      act(() => {
        result.current.addEnvironment(newEnv);
      });

      expect(result.current.environments).toHaveLength(4);
      expect(result.current.environments.find((env) => env.id === 'testing')).toEqual(newEnv);
    });

    it('should update an environment', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.updateEnvironment('development', {
          name: 'Dev Environment',
        });
      });

      const devEnv = result.current.environments.find((env) => env.id === 'development');
      expect(devEnv?.name).toBe('Dev Environment');
    });

    it('should delete an environment', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.deleteEnvironment('staging');
      });

      expect(result.current.environments).toHaveLength(2);
      expect(result.current.environments.find((env) => env.id === 'staging')).toBeUndefined();
    });

    it('should set active environment', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.setActiveEnvironment('production');
      });

      expect(result.current.activeEnvironmentId).toBe('production');
    });
  });

  describe('Variable Resolution', () => {
    it('should resolve variables with environment overrides', () => {
      const { result } = renderHook(() => useVariablesStore());

      // Add global variables
      act(() => {
        result.current.addGlobalVariable({
          name: 'API_URL',
          value: 'https://global.api.com',
          enabled: true,
        });
        result.current.addGlobalVariable({
          name: 'TIMEOUT',
          value: '30000',
          enabled: true,
        });
      });

      // Add environment variable that overrides global
      act(() => {
        result.current.addEnvironmentVariable('development', {
          name: 'API_URL',
          value: 'https://dev.api.com',
          enabled: true,
        });
      });

      const resolved = result.current.getResolvedVariables();
      expect(resolved.API_URL.value).toBe('https://dev.api.com'); // Environment override
      expect(resolved.TIMEOUT.value).toBe('30000'); // Global variable
    });

    it('should only include enabled variables in resolution', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addGlobalVariable({
          name: 'ENABLED_VAR',
          value: 'enabled',
          enabled: true,
        });
        result.current.addGlobalVariable({
          name: 'DISABLED_VAR',
          value: 'disabled',
          enabled: false,
        });
      });

      const resolved = result.current.getResolvedVariables();
      expect(resolved.ENABLED_VAR).toBeDefined();
      expect(resolved.DISABLED_VAR).toBeUndefined();
    });

    it('should resolve individual variable by name', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addGlobalVariable({
          name: 'MY_VAR',
          value: 'my-value',
          enabled: true,
        });
      });

      expect(result.current.resolveVariable('MY_VAR')).toBe('my-value');
      expect(result.current.resolveVariable('NON_EXISTENT')).toBeUndefined();
    });

    it('should return undefined for disabled variables when resolving', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addGlobalVariable({
          name: 'DISABLED_VAR',
          value: 'value',
          enabled: false,
        });
      });

      expect(result.current.resolveVariable('DISABLED_VAR')).toBeUndefined();
    });

    it('should handle resolution when no active environment', () => {
      const { result } = renderHook(() => useVariablesStore());

      // Add global variable
      act(() => {
        result.current.addGlobalVariable({
          name: 'GLOBAL_VAR',
          value: 'global-value',
          enabled: true,
        });
        // Set non-existent environment
        result.current.setActiveEnvironment('non-existent');
      });

      const resolved = result.current.getResolvedVariables();
      expect(resolved.GLOBAL_VAR.value).toBe('global-value');
    });
  });

  describe('Secure Variables', () => {
    it('should handle secure variables properly', () => {
      const { result } = renderHook(() => useVariablesStore());

      act(() => {
        result.current.addGlobalVariable({
          name: 'SECRET_KEY',
          value: 'super-secret-key',
          enabled: true,
          secure: true,
          description: 'API Secret Key',
        });
      });

      const secureVar = result.current.globalVariables.SECRET_KEY;
      expect(secureVar.secure).toBe(true);
      expect(secureVar.value).toBe('super-secret-key');
      expect(secureVar.description).toBe('API Secret Key');
    });
  });
});
