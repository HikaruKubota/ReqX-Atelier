import { useState, useCallback, useRef } from 'react';
import type {
  KeyValuePair,
  RequestHeader,
  VariableExtraction,
  ApiResult,
  ApiError,
} from '../types';

export interface TabEditorState {
  body: KeyValuePair[];
  params: KeyValuePair[];
  url?: string;
  method?: string;
  headers?: RequestHeader[];
  requestNameForSave?: string;
  variableExtraction?: VariableExtraction;
}

export interface TabResponseState {
  response: ApiResult | null;
  error: ApiError | null;
  responseTime: number | null;
}

export function useTabState() {
  const [tabEditorStates, setTabEditorStates] = useState<Record<string, TabEditorState>>({});
  const [tabResponses, setTabResponses] = useState<Record<string, TabResponseState>>({});
  const isSwitchingTabRef = useRef(false);

  const updateTabEditorState = useCallback((tabId: string, updates: Partial<TabEditorState>) => {
    setTabEditorStates((prev) => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        ...updates,
      },
    }));
  }, []);

  const removeTabState = useCallback((tabId: string) => {
    setTabEditorStates((prev) => {
      const newState = { ...prev };
      delete newState[tabId];
      return newState;
    });
    setTabResponses((prev) => {
      const newState = { ...prev };
      delete newState[tabId];
      return newState;
    });
  }, []);

  const saveTabResponse = useCallback((tabId: string, responseState: TabResponseState) => {
    setTabResponses((prev) => ({
      ...prev,
      [tabId]: responseState,
    }));
  }, []);

  const getTabEditorState = useCallback(
    (tabId: string): TabEditorState | undefined => {
      return tabEditorStates[tabId];
    },
    [tabEditorStates],
  );

  const getTabResponse = useCallback(
    (tabId: string): TabResponseState | undefined => {
      return tabResponses[tabId];
    },
    [tabResponses],
  );

  return {
    tabEditorStates,
    tabResponses,
    isSwitchingTabRef,
    updateTabEditorState,
    removeTabState,
    saveTabResponse,
    getTabEditorState,
    getTabResponse,
  };
}
