import { useCallback } from 'react';
import { useTabs } from './useTabs';
import { useTabDirtyTracker } from './useTabDirtyTracker';
import { useRequestActions } from './useRequestActions';
import type { RequestEditorPanelRef, SavedFolder } from '../types';

interface UseRequestExecutionProps {
  editorPanelRef: React.RefObject<RequestEditorPanelRef>;
  requestEditor: {
    methodRef: React.RefObject<string>;
    urlRef: React.RefObject<string>;
    headersRef: React.RefObject<any[]>;
    paramsRef: React.RefObject<any[]>;
    variableExtractionRef: React.RefObject<any>;
    requestNameForSaveRef: React.RefObject<string>;
    markTabDirty?: (id: string) => void;
    markTabClean?: (id: string) => void;
  };
  activeRequestIdRef: React.RefObject<string | null>;
  setActiveRequestId: (id: string | null) => void;
  setRequestNameForSave: (name: string) => void;
  addRequest: (
    request: Partial<{
      name: string;
      method: string;
      url: string;
      headers: any[];
      body: any[];
      params: any[];
      variableExtraction: any;
    }>,
  ) => string;
  updateSavedRequest: (
    id: string,
    updates: Partial<{
      name: string;
      method: string;
      url: string;
      headers: any[];
      body: any[];
      params: any[];
      variableExtraction: any;
    }>,
  ) => void;
  executeRequest: (
    method: string,
    url: string,
    body?: string,
    headers?: Record<string, string>,
  ) => Promise<void>;
  updateFolder: (id: string, updates: Partial<{ name: string; requestIds: string[] }>) => void;
  savedFolders: SavedFolder[];
  newRequestFolderId: string | null;
  setNewRequestFolderId: (id: string | null) => void;
  setSaveToastOpen: (open: boolean) => void;
}

export function useRequestExecution({
  editorPanelRef,
  requestEditor,
  activeRequestIdRef,
  setActiveRequestId,
  setRequestNameForSave,
  addRequest,
  updateSavedRequest,
  executeRequest,
  updateFolder,
  savedFolders,
  newRequestFolderId,
  setNewRequestFolderId,
  setSaveToastOpen,
}: UseRequestExecutionProps) {
  const tabs = useTabs();

  const { resetDirtyState } = useTabDirtyTracker({
    tabId: tabs.activeTabId,
    requestEditor,
    markTabDirty: tabs.markTabDirty,
    markTabClean: tabs.markTabClean,
  });

  const { executeSendRequest, executeSaveRequest } = useRequestActions({
    editorPanelRef,
    methodRef: requestEditor.methodRef,
    urlRef: requestEditor.urlRef,
    headersRef: requestEditor.headersRef,
    paramsRef: requestEditor.paramsRef,
    variableExtractionRef: requestEditor.variableExtractionRef,
    requestNameForSaveRef: requestEditor.requestNameForSaveRef,
    setRequestNameForSave,
    activeRequestIdRef,
    setActiveRequestId,
    addRequest,
    updateSavedRequest,
    executeRequest,
    resetDirtyState,
  });

  const handleSaveButtonClick = useCallback(() => {
    const activeTab = tabs.getActiveTab();
    if (!activeTab) return;

    const prevId = activeRequestIdRef.current;
    const savedId = executeSaveRequest();
    if (!savedId) return;

    setSaveToastOpen(true);
    resetDirtyState();

    if (activeTab && !activeTab.requestId) {
      tabs.updateTab(activeTab.tabId, { requestId: savedId });
    }

    if (!prevId && newRequestFolderId) {
      const folder = savedFolders.find((f) => f.id === newRequestFolderId);
      if (folder) {
        updateFolder(newRequestFolderId, {
          requestIds: [...folder.requestIds, savedId],
        });
      }
      setNewRequestFolderId(null);
    }
  }, [
    executeSaveRequest,
    tabs,
    activeRequestIdRef,
    newRequestFolderId,
    savedFolders,
    updateFolder,
    resetDirtyState,
    setSaveToastOpen,
    setNewRequestFolderId,
  ]);

  return {
    executeSendRequest,
    handleSaveButtonClick,
    resetDirtyState,
  };
}
