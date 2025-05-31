import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Variable {
  name: string
  value: string
  enabled: boolean
  secure?: boolean
  description?: string
}

export interface VariableSet {
  [key: string]: Variable
}

export interface Environment {
  id: string
  name: string
  variables: VariableSet
}

interface VariablesState {
  // Global variables (shared across all environments)
  globalVariables: VariableSet
  
  // Environment configurations
  environments: Environment[]
  
  // Current active environment ID
  activeEnvironmentId: string
  
  // Actions
  setActiveEnvironment: (environmentId: string) => void
  
  // Global variable actions
  addGlobalVariable: (variable: Variable) => void
  updateGlobalVariable: (name: string, updates: Partial<Variable>) => void
  deleteGlobalVariable: (name: string) => void
  
  // Environment variable actions
  addEnvironmentVariable: (environmentId: string, variable: Variable) => void
  updateEnvironmentVariable: (environmentId: string, name: string, updates: Partial<Variable>) => void
  deleteEnvironmentVariable: (environmentId: string, name: string) => void
  
  // Environment management
  addEnvironment: (environment: Environment) => void
  updateEnvironment: (environmentId: string, updates: Partial<Environment>) => void
  deleteEnvironment: (environmentId: string) => void
  
  // Utility functions
  getResolvedVariables: () => VariableSet
  resolveVariable: (variableName: string) => string | undefined
}

// Default environments
const defaultEnvironments: Environment[] = [
  {
    id: 'development',
    name: 'Development',
    variables: {}
  },
  {
    id: 'staging',
    name: 'Staging',
    variables: {}
  },
  {
    id: 'production',
    name: 'Production',
    variables: {}
  }
]

export const useVariablesStore = create<VariablesState>()(
  persist(
    (set, get) => ({
      globalVariables: {},
      environments: defaultEnvironments,
      activeEnvironmentId: 'development',

      setActiveEnvironment: (environmentId) => {
        set({ activeEnvironmentId: environmentId })
      },

      // Global variable actions
      addGlobalVariable: (variable) => {
        set((state) => ({
          globalVariables: {
            ...state.globalVariables,
            [variable.name]: variable
          }
        }))
      },

      updateGlobalVariable: (name, updates) => {
        set((state) => ({
          globalVariables: {
            ...state.globalVariables,
            [name]: {
              ...state.globalVariables[name],
              ...updates
            }
          }
        }))
      },

      deleteGlobalVariable: (name) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _, ...rest } = state.globalVariables
          return { globalVariables: rest }
        })
      },

      // Environment variable actions
      addEnvironmentVariable: (environmentId, variable) => {
        set((state) => ({
          environments: state.environments.map((env) =>
            env.id === environmentId
              ? {
                  ...env,
                  variables: {
                    ...env.variables,
                    [variable.name]: variable
                  }
                }
              : env
          )
        }))
      },

      updateEnvironmentVariable: (environmentId, name, updates) => {
        set((state) => ({
          environments: state.environments.map((env) =>
            env.id === environmentId
              ? {
                  ...env,
                  variables: {
                    ...env.variables,
                    [name]: {
                      ...env.variables[name],
                      ...updates
                    }
                  }
                }
              : env
          )
        }))
      },

      deleteEnvironmentVariable: (environmentId, name) => {
        set((state) => ({
          environments: state.environments.map((env) =>
            env.id === environmentId
              ? {
                  ...env,
                  variables: Object.fromEntries(
                    Object.entries(env.variables).filter(([key]) => key !== name)
                  )
                }
              : env
          )
        }))
      },

      // Environment management
      addEnvironment: (environment) => {
        set((state) => ({
          environments: [...state.environments, environment]
        }))
      },

      updateEnvironment: (environmentId, updates) => {
        set((state) => ({
          environments: state.environments.map((env) =>
            env.id === environmentId ? { ...env, ...updates } : env
          )
        }))
      },

      deleteEnvironment: (environmentId) => {
        set((state) => ({
          environments: state.environments.filter((env) => env.id !== environmentId)
        }))
      },

      // Utility functions
      getResolvedVariables: () => {
        const state = get()
        const activeEnvironment = state.environments.find(
          (env) => env.id === state.activeEnvironmentId
        )
        
        const resolved: VariableSet = {}
        
        // Add all enabled global variables
        Object.entries(state.globalVariables).forEach(([name, variable]) => {
          if (variable.enabled) {
            resolved[name] = variable
          }
        })
        
        if (!activeEnvironment) {
          return resolved
        }
        
        // Override with enabled environment variables
        Object.entries(activeEnvironment.variables).forEach(([name, variable]) => {
          if (variable.enabled) {
            resolved[name] = variable
          }
        })
        
        return resolved
      },

      resolveVariable: (variableName: string) => {
        const resolved = get().getResolvedVariables()
        const variable = resolved[variableName]
        return variable?.enabled ? variable.value : undefined
      }
    }),
    {
      name: 'variables-storage',
      version: 1
    }
  )
)