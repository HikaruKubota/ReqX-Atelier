import { useCallback } from 'react';
import { SavedRequest } from './useSavedRequests';

export function useRequestActions({
  editorPanelRef,
  methodRef,
  urlRef,
  headersRef,
  requestNameForSaveRef,
  activeRequestIdRef,
  setActiveRequestId,
  addRequest,
  updateSavedRequest,
  executeRequest,
}: {
  editorPanelRef: React.RefObject<any>;
  methodRef: React.RefObject<string>;
  urlRef: React.RefObject<string>;
  headersRef: React.RefObject<any[]>;
  requestNameForSaveRef: React.RefObject<string>;
  activeRequestIdRef: React.RefObject<string | null>;
  setActiveRequestId: (id: string) => void;
  addRequest: (req: SavedRequest) => string;
  updateSavedRequest: (id: string, req: Omit<SavedRequest, 'id'>) => void;
  executeRequest: (...args: any[]) => Promise<void>;
}) {
  // リクエスト送信
  const executeSendRequest = useCallback(async () => {
    const currentBuiltRequestBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
    const activeHeaders = headersRef.current
      .filter(h => h.enabled && h.key.trim() !== '')
      .reduce((acc, h) => {
        acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>);
    await executeRequest(methodRef.current, urlRef.current, currentBuiltRequestBody, activeHeaders);
  }, [executeRequest, headersRef, methodRef, urlRef]);

  // リクエスト保存
  const executeSaveRequest = useCallback(() => {
    const nameToSave = requestNameForSaveRef.current.trim();
    const currentMethod = methodRef.current;
    const currentUrl = urlRef.current;
    const currentBodyKeyValuePairsFromEditor = editorPanelRef.current?.getRequestBodyKeyValuePairs() || [];
    const currentActiveRequestId = activeRequestIdRef.current;
    const currentHeaders = headersRef.current;

    const requestDataToSave: Omit<SavedRequest, 'id'> = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      headers: currentHeaders,
      bodyKeyValuePairs: currentBodyKeyValuePairsFromEditor,
    };

    if (currentActiveRequestId) {
      updateSavedRequest(currentActiveRequestId, requestDataToSave);
    } else {
      const newId = addRequest(requestDataToSave as SavedRequest);
      setActiveRequestId(newId);
    }
  }, [addRequest, updateSavedRequest, setActiveRequestId, requestNameForSaveRef, methodRef, urlRef, activeRequestIdRef, headersRef]);

  return { executeSendRequest, executeSaveRequest };
}
