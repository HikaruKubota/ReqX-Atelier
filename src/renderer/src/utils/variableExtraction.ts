import { JSONPath } from 'jsonpath-plus';
import type { VariableExtraction, ApiResult } from '../types';
import { useVariablesStore } from '../store/variablesStore';

export interface ExtractionResult {
  variableName: string;
  value: string;
  scope: 'global' | 'environment';
  success: boolean;
  error?: string;
}

export function extractVariablesFromResponse(
  response: ApiResult,
  variableExtraction: VariableExtraction | undefined,
): ExtractionResult[] {
  if (!variableExtraction?.enabled || !variableExtraction.extractionRules.length) {
    return [];
  }

  const results: ExtractionResult[] = [];

  for (const rule of variableExtraction.extractionRules) {
    if (!rule.enabled) continue;

    const result: ExtractionResult = {
      variableName: rule.variableName,
      value: '',
      scope: rule.scope,
      success: false,
    };

    try {
      switch (rule.source) {
        case 'body-json': {
          if (rule.path && response.data) {
            const values = JSONPath({
              path: rule.path,
              json: response.data,
            });

            if (values.length > 0) {
              // Take the first match
              result.value = typeof values[0] === 'string' ? values[0] : JSON.stringify(values[0]);
              result.success = true;
            } else {
              result.error = `No value found at path: ${rule.path}`;
            }
          }
          break;
        }

        case 'header': {
          if (rule.headerName && response.headers) {
            const headerValue = response.headers[rule.headerName];
            if (headerValue !== undefined) {
              result.value = String(headerValue);
              result.success = true;
            } else {
              result.error = `Header not found: ${rule.headerName}`;
            }
          }
          break;
        }

        case 'status': {
          if (response.status) {
            result.value = String(response.status);
            result.success = true;
          }
          break;
        }

        // Other sources can be implemented later
        default:
          result.error = `Source type not implemented: ${rule.source}`;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    results.push(result);
  }

  return results;
}

export function applyExtractedVariables(results: ExtractionResult[]): void {
  const store = useVariablesStore.getState();
  const {
    addGlobalVariable,
    updateGlobalVariable,
    addEnvironmentVariable,
    updateEnvironmentVariable,
  } = store;
  const activeEnvironmentId = store.activeEnvironmentId;

  for (const result of results) {
    if (!result.success || !result.variableName) continue;

    const variable = {
      name: result.variableName,
      value: result.value,
      enabled: true,
      secure: false,
    };

    if (result.scope === 'global') {
      // Check if variable exists
      if (store.globalVariables[result.variableName]) {
        updateGlobalVariable(result.variableName, { value: result.value });
      } else {
        addGlobalVariable(variable);
      }
    } else if (result.scope === 'environment' && activeEnvironmentId) {
      const activeEnv = store.environments.find((env) => env.id === activeEnvironmentId);
      if (activeEnv) {
        if (activeEnv.variables[result.variableName]) {
          updateEnvironmentVariable(activeEnvironmentId, result.variableName, {
            value: result.value,
          });
        } else {
          addEnvironmentVariable(activeEnvironmentId, variable);
        }
      }
    }
  }
}
