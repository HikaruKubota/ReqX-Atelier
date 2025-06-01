import { useCallback } from 'react';
import type {
  SavedRequest,
  RequestEditorPanelRef,
  RequestHeader,
  KeyValuePair,
  VariableExtraction,
} from '../types';
import { useVariablesStore } from '../store/variablesStore';

export function useRequestActions({
  editorPanelRef,
  methodRef,
  urlRef,
  headersRef,
  paramsRef,
  variableExtractionRef,
  requestNameForSaveRef,
  setRequestNameForSave,
  activeRequestIdRef,
  setActiveRequestId,
  addRequest,
  updateSavedRequest,
  executeRequest,
  resetDirtyState,
}: {
  editorPanelRef: React.RefObject<RequestEditorPanelRef | null>;
  methodRef: React.RefObject<string>;
  urlRef: React.RefObject<string>;
  headersRef: React.RefObject<RequestHeader[]>;
  paramsRef: React.RefObject<KeyValuePair[]>;
  variableExtractionRef?: React.RefObject<VariableExtraction | undefined>;
  requestNameForSaveRef: React.RefObject<string>;
  setRequestNameForSave: (name: string) => void;
  activeRequestIdRef: React.RefObject<string | null>;
  setActiveRequestId: (id: string) => void;
  addRequest: (req: Omit<SavedRequest, 'id'>) => string;
  updateSavedRequest: (id: string, req: Partial<Omit<SavedRequest, 'id'>>) => void;
  executeRequest: (
    method: string,
    url: string,
    body?: string,
    headers?: Record<string, string>,
  ) => Promise<void>;
  resetDirtyState?: () => void;
}) {
  const getResolvedVariables = useVariablesStore((state) => state.getResolvedVariables);

  // Helper function to resolve variables in a string
  const resolveVariablesInString = useCallback(
    (str: string): string => {
      const variables = getResolvedVariables();

      const resolved = str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        const variable = variables[varName];
        if (!variable) {
          return match;
        }
        return variable.value;
      });

      return resolved;
    },
    [getResolvedVariables],
  );

  // リクエスト送信
  const executeSendRequest = useCallback(async () => {
    // Resolve variables in the URL first
    // Since URL and params are now synced, the URL should already contain the params
    // Just resolve variables in the URL
    const resolvedUrl = resolveVariablesInString(urlRef.current);
    console.log('[executeSendRequest] URL:', urlRef.current, 'Resolved URL:', resolvedUrl);

    // Resolve variables in headers
    const activeHeaders = headersRef.current
      .filter((h) => h.enabled && h.key.trim() !== '')
      .reduce(
        (acc, h) => {
          const resolvedKey = resolveVariablesInString(h.key);
          const resolvedValue = resolveVariablesInString(h.value);
          acc[resolvedKey] = resolvedValue;
          return acc;
        },
        {} as Record<string, string>,
      );

    // Resolve variables in request body
    let resolvedBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
    if (resolvedBody) {
      resolvedBody = resolveVariablesInString(resolvedBody);
    }

    await executeRequest(methodRef.current, resolvedUrl, resolvedBody, activeHeaders);
    if (resetDirtyState) {
      resetDirtyState(); // Reset dirty state after sending request
    }
  }, [
    executeRequest,
    headersRef,
    methodRef,
    urlRef,
    paramsRef,
    resetDirtyState,
    resolveVariablesInString,
  ]);

  // リクエスト保存
  const executeSaveRequest = useCallback((): string => {
    const nameToSave =
      requestNameForSaveRef.current.trim() !== ''
        ? requestNameForSaveRef.current.trim()
        : 'Untitled Request';
    setRequestNameForSave(nameToSave);
    const currentMethod = methodRef.current;
    const currentUrl = urlRef.current;
    const bodyFromEditor = editorPanelRef.current?.getBody() || [];
    const paramsFromEditor = editorPanelRef.current?.getParams() || [];
    const currentActiveRequestId = activeRequestIdRef.current;
    const currentHeaders = headersRef.current;

    const currentVariableExtraction = variableExtractionRef?.current;
    console.log('[executeSaveRequest] variableExtraction:', currentVariableExtraction);

    const requestDataToSave: Omit<SavedRequest, 'id'> = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      headers: currentHeaders,
      body: bodyFromEditor,
      params: paramsFromEditor,
      variableExtraction: currentVariableExtraction,
    };
    console.log('[executeSaveRequest] requestDataToSave:', requestDataToSave);

    if (currentActiveRequestId) {
      updateSavedRequest(currentActiveRequestId, requestDataToSave);
      return currentActiveRequestId;
    } else {
      const newId = addRequest(requestDataToSave);
      setActiveRequestId(newId);
      return newId;
    }
  }, [
    addRequest,
    updateSavedRequest,
    setActiveRequestId,
    setRequestNameForSave,
    requestNameForSaveRef,
    methodRef,
    urlRef,
    activeRequestIdRef,
    headersRef,
    paramsRef,
    variableExtractionRef,
    editorPanelRef,
  ]);

  return { executeSendRequest, executeSaveRequest };
}
