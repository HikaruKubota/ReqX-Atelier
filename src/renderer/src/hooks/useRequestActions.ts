import { useCallback } from 'react';
import type { SavedRequest, RequestEditorPanelRef, RequestHeader } from '../types';

export function useRequestActions({
  editorPanelRef,
  methodRef,
  urlRef,
  headersRef,
  requestNameForSaveRef,
  setRequestNameForSave,
  activeRequestIdRef,
  setActiveRequestId,
  addRequest,
  updateSavedRequest,
  executeRequest,
}: {
  editorPanelRef: React.RefObject<RequestEditorPanelRef | null>;
  methodRef: React.RefObject<string>;
  urlRef: React.RefObject<string>;
  headersRef: React.RefObject<RequestHeader[]>;
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
}) {
  // リクエスト送信
  const executeSendRequest = useCallback(async () => {
    const currentBuiltRequestBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
    const activeHeaders = headersRef.current
      .filter((h) => h.enabled && h.key.trim() !== '')
      .reduce(
        (acc, h) => {
          acc[h.key] = h.value;
          return acc;
        },
        {} as Record<string, string>,
      );
    await executeRequest(methodRef.current, urlRef.current, currentBuiltRequestBody, activeHeaders);
  }, [executeRequest, headersRef, methodRef, urlRef]);

  // リクエスト保存
  const executeSaveRequest = useCallback(() => {
    const nameToSave =
      requestNameForSaveRef.current.trim() !== ''
        ? requestNameForSaveRef.current.trim()
        : 'Untitled Request';
    setRequestNameForSave(nameToSave);
    const currentMethod = methodRef.current;
    const currentUrl = urlRef.current;
    const currentBodyKeyValuePairsFromEditor =
      editorPanelRef.current?.getRequestBodyKeyValuePairs() || [];
    const currentActiveRequestId = activeRequestIdRef.current;
    const currentHeaders = headersRef.current;

    const requestDataToSave: Omit<SavedRequest, 'id'> = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      headers: currentHeaders,
      bodyKeyValuePairs: currentBodyKeyValuePairsFromEditor,
      body: currentBodyKeyValuePairsFromEditor,
    };

    if (currentActiveRequestId) {
      updateSavedRequest(currentActiveRequestId, requestDataToSave);
    } else {
      const newId = addRequest(requestDataToSave);
      setActiveRequestId(newId);
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
  ]);

  return { executeSendRequest, executeSaveRequest };
}
