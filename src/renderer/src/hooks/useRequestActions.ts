import { useCallback } from 'react';
import type { SavedRequest, RequestEditorPanelRef, RequestHeader, KeyValuePair } from '../types';

export function useRequestActions({
  editorPanelRef,
  methodRef,
  urlRef,
  headersRef,
  paramsRef,
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
  // リクエスト送信
  const executeSendRequest = useCallback(async () => {
    const currentBuiltRequestBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
    const queryString = paramsRef.current
      .filter((p) => p.enabled && p.keyName.trim() !== '')
      .map((p) => `${encodeURIComponent(p.keyName)}=${encodeURIComponent(p.value)}`)
      .join('&');
    const urlWithParams = queryString
      ? `${urlRef.current}${urlRef.current.includes('?') ? '&' : '?'}${queryString}`
      : urlRef.current;
    const activeHeaders = headersRef.current
      .filter((h) => h.enabled && h.key.trim() !== '')
      .reduce(
        (acc, h) => {
          acc[h.key] = h.value;
          return acc;
        },
        {} as Record<string, string>,
      );
    await executeRequest(methodRef.current, urlWithParams, currentBuiltRequestBody, activeHeaders);
    if (resetDirtyState) {
      resetDirtyState(); // Reset dirty state after sending request
    }
  }, [executeRequest, headersRef, methodRef, urlRef, paramsRef, resetDirtyState]);

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

    const requestDataToSave: Omit<SavedRequest, 'id'> = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      headers: currentHeaders,
      body: bodyFromEditor,
      params: paramsFromEditor,
    };

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
  ]);

  return { executeSendRequest, executeSaveRequest };
}
