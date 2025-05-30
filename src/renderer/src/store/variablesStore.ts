import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Variable, VariableScope, VariableResolutionContext } from '../types';

export interface VariablesState {
  variables: VariableScope;
  addVariable: (scope: keyof VariableScope, scopeId: string | null, variable: Omit<Variable, 'id'>) => string;
  updateVariable: (scope: keyof VariableScope, scopeId: string | null, id: string, updated: Partial<Omit<Variable, 'id'>>) => void;
  deleteVariable: (scope: keyof VariableScope, scopeId: string | null, id: string) => void;
  getVariables: (scope: keyof VariableScope, scopeId?: string | null) => Variable[];
  resolveVariables: (text: string, context: VariableResolutionContext) => string;
  validateVariableName: (name: string) => boolean;
  getUndefinedVariables: (text: string, context: VariableResolutionContext) => string[];
}

const LOCAL_STORAGE_KEY = 'reqx_variables';

const VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const VARIABLE_REFERENCE_REGEX = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

const generateVariableId = () => `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useVariablesStore = create<VariablesState>()(
  persist(
    (set, get) => ({
      variables: {
        global: [],
        collections: {},
        folders: {},
        requests: {},
      },

      addVariable: (scope, scopeId, variable) => {
        const newId = generateVariableId();
        const newVariable: Variable = {
          ...variable,
          id: newId,
        };

        set((state) => {
          const newVariables = { ...state.variables };
          
          if (scope === 'global') {
            newVariables.global = [...newVariables.global, newVariable];
          } else if (scopeId) {
            const scopeKey = scopeId;
            newVariables[scope] = {
              ...newVariables[scope],
              [scopeKey]: [...(newVariables[scope][scopeKey] || []), newVariable],
            };
          }

          return { variables: newVariables };
        });

        return newId;
      },

      updateVariable: (scope, scopeId, id, updated) => {
        set((state) => {
          const newVariables = { ...state.variables };
          
          if (scope === 'global') {
            newVariables.global = newVariables.global.map((v) =>
              v.id === id ? { ...v, ...updated } : v
            );
          } else if (scopeId) {
            const scopeKey = scopeId;
            const currentVars = newVariables[scope][scopeKey] || [];
            newVariables[scope] = {
              ...newVariables[scope],
              [scopeKey]: currentVars.map((v) =>
                v.id === id ? { ...v, ...updated } : v
              ),
            };
          }

          return { variables: newVariables };
        });
      },

      deleteVariable: (scope, scopeId, id) => {
        set((state) => {
          const newVariables = { ...state.variables };
          
          if (scope === 'global') {
            newVariables.global = newVariables.global.filter((v) => v.id !== id);
          } else if (scopeId) {
            const scopeKey = scopeId;
            const currentVars = newVariables[scope][scopeKey] || [];
            newVariables[scope] = {
              ...newVariables[scope],
              [scopeKey]: currentVars.filter((v) => v.id !== id),
            };
          }

          return { variables: newVariables };
        });
      },

      getVariables: (scope, scopeId = null) => {
        const state = get();
        
        if (scope === 'global') {
          return state.variables.global;
        } else if (scopeId) {
          return state.variables[scope][scopeId] || [];
        }
        
        return [];
      },

      resolveVariables: (text, context) => {
        const state = get();
        let resolvedText = text;

        // Build variable map with priority order: request > folder (child to parent) > collection > global
        const variableMap = new Map<string, string>();

        // Global variables (lowest priority)
        state.variables.global.forEach((v) => {
          if (v.enabled) {
            variableMap.set(v.name, v.value);
          }
        });

        // Collection variables
        if (context.collectionId && state.variables.collections[context.collectionId]) {
          state.variables.collections[context.collectionId].forEach((v) => {
            if (v.enabled) {
              variableMap.set(v.name, v.value);
            }
          });
        }

        // Folder variables (from parent to child, so child (closer) variables override parent variables)
        if (context.folderHierarchy && context.folderHierarchy.length > 0) {
          // context.folderHierarchy is ordered from child to root, so we reverse it
          // to process from root to child, allowing child variables to override parent variables
          const folderIds = [...context.folderHierarchy].reverse();
          folderIds.forEach((folderId) => {
            if (state.variables.folders[folderId]) {
              state.variables.folders[folderId].forEach((v) => {
                if (v.enabled) {
                  // Later (closer to request) folder variables will override earlier ones
                  variableMap.set(v.name, v.value);
                }
              });
            }
          });
        } else if (context.folderId && state.variables.folders[context.folderId]) {
          // Fallback to single folder for backward compatibility
          state.variables.folders[context.folderId].forEach((v) => {
            if (v.enabled) {
              variableMap.set(v.name, v.value);
            }
          });
        }

        // Request variables (highest priority)
        if (context.requestId && state.variables.requests[context.requestId]) {
          state.variables.requests[context.requestId].forEach((v) => {
            if (v.enabled) {
              variableMap.set(v.name, v.value);
            }
          });
        }

        // Replace all variable references
        resolvedText = resolvedText.replace(VARIABLE_REFERENCE_REGEX, (match, variableName) => {
          return variableMap.get(variableName) || match;
        });

        return resolvedText;
      },

      validateVariableName: (name) => {
        return VARIABLE_NAME_REGEX.test(name);
      },

      getUndefinedVariables: (text, context) => {
        const state = get();
        const undefinedVars: string[] = [];

        // Build set of available variable names
        const availableVars = new Set<string>();

        // Global variables
        state.variables.global.forEach((v) => {
          if (v.enabled) {
            availableVars.add(v.name);
          }
        });

        // Collection variables
        if (context.collectionId && state.variables.collections[context.collectionId]) {
          state.variables.collections[context.collectionId].forEach((v) => {
            if (v.enabled) {
              availableVars.add(v.name);
            }
          });
        }

        // Folder variables (support hierarchy)
        if (context.folderHierarchy && context.folderHierarchy.length > 0) {
          context.folderHierarchy.forEach((folderId) => {
            if (state.variables.folders[folderId]) {
              state.variables.folders[folderId].forEach((v) => {
                if (v.enabled) {
                  availableVars.add(v.name);
                }
              });
            }
          });
        } else if (context.folderId && state.variables.folders[context.folderId]) {
          // Fallback to single folder for backward compatibility
          state.variables.folders[context.folderId].forEach((v) => {
            if (v.enabled) {
              availableVars.add(v.name);
            }
          });
        }

        // Request variables
        if (context.requestId && state.variables.requests[context.requestId]) {
          state.variables.requests[context.requestId].forEach((v) => {
            if (v.enabled) {
              availableVars.add(v.name);
            }
          });
        }

        // Find undefined variables
        const matches = text.matchAll(VARIABLE_REFERENCE_REGEX);
        for (const match of matches) {
          const variableName = match[1];
          if (!availableVars.has(variableName) && !undefinedVars.includes(variableName)) {
            undefinedVars.push(variableName);
          }
        }

        return undefinedVars;
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);