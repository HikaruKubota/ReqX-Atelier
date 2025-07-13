import React, { useCallback, useRef, useState } from 'react';
import { useSavedRequests } from './hooks/useSavedRequests';
import { useRequestEditor } from './hooks/useRequestEditor';
import { useApiResponseHandler } from './hooks/useApiResponseHandler';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabs } from './hooks/useTabs';
import { useTabState } from './hooks/useTabState';
import { useRequestExecution } from './hooks/useRequestExecution';
import { useTranslation } from 'react-i18next';
import { TabBar } from './components/organisms/TabBar';
import { AppLayout } from './containers/AppLayout';
import { StateSync } from './containers/StateSync';
import type { SavedRequest, RequestEditorPanelRef } from './types';

export default function App() {
  const { t } = useTranslation();
  const editorPanelRef = useRef<RequestEditorPanelRef>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveToastOpen, setSaveToastOpen] = useState(false);
  const [variablesPanelOpen, setVariablesPanelOpen] = useState(false);
  const [newRequestFolderId, setNewRequestFolderId] = useState<string | null>(null);

  // Use custom hooks
  const {
    method,
    setMethod,
    methodRef,
    url,
    setUrl,
    urlRef,
    body,
    setBody,
    params,
    setParams,
    paramsRef,
    requestNameForSave,
    setRequestNameForSave,
    requestNameForSaveRef,
    activeRequestId,
    setActiveRequestId,
    activeRequestIdRef,
    headers,
    setHeaders,
    headersRef,
    addHeader,
    updateHeader,
    removeHeader,
    variableExtraction,
    setVariableExtraction,
    variableExtractionRef,
    loadRequest: loadRequestIntoEditor,
    resetEditor,
  } = useRequestEditor();

  const {
    response,
    error,
    loading,
    responseTime,
    executeRequest,
    resetApiResponse,
    setApiResponseState,
  } = useApiResponseHandler();

  const {
    savedRequests,
    savedFolders,
    addRequest,
    updateRequest: updateSavedRequest,
    deleteRequest,
    copyRequest,
    copyFolder,
    addFolder,
    updateFolder,
    deleteFolderRecursive,
    moveRequest,
    moveFolder,
  } = useSavedRequests();

  const tabs = useTabs();
  const {
    tabEditorStates,
    tabResponses,
    isSwitchingTabRef,
    updateTabEditorState,
    removeTabState,
    saveTabResponse,
    getTabEditorState,
    getTabResponse,
  } = useTabState();

  // Get current tab's editor state
  const currentTabEditorState = tabs.activeTabId ? tabEditorStates[tabs.activeTabId] : undefined;
  const currentBody = currentTabEditorState?.body || body;
  const currentParams = currentTabEditorState?.params || params;

  // Update tab state callbacks
  const updateTabBody = useCallback(
    (newBody: typeof body) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;
      updateTabEditorState(tabId, { body: newBody });
      setBody(newBody);
    },
    [tabs.activeTabId, updateTabEditorState, setBody],
  );

  const updateTabParams = useCallback(
    (newParams: typeof params) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;
      updateTabEditorState(tabId, { params: newParams });
      setParams(newParams);
    },
    [tabs.activeTabId, updateTabEditorState, setParams],
  );

  const updateTabState = useCallback(
    (updates: Parameters<typeof updateTabEditorState>[1]) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;
      updateTabEditorState(tabId, updates);
    },
    [tabs.activeTabId, updateTabEditorState],
  );

  // Wrapped setters that also update tab state
  const setMethodWithTabUpdate = useCallback(
    (val: string) => {
      setMethod(val);
      updateTabState({ method: val });
    },
    [setMethod, updateTabState],
  );

  const setRequestNameForSaveWithTabUpdate = useCallback(
    (val: string) => {
      setRequestNameForSave(val);
      updateTabState({ requestNameForSave: val });
    },
    [setRequestNameForSave, updateTabState],
  );

  const setHeadersWithTabUpdate = useCallback(
    (val: typeof headers) => {
      setHeaders(val);
      updateTabState({ headers: val });
    },
    [setHeaders, updateTabState],
  );

  const setVariableExtractionWithTabUpdate = useCallback(
    (val: typeof variableExtraction) => {
      setVariableExtraction(val);
      updateTabState({ variableExtraction: val });
    },
    [setVariableExtraction, updateTabState],
  );

  const requestEditor = {
    method,
    setMethod: setMethodWithTabUpdate,
    methodRef,
    url,
    setUrl,
    urlRef,
    body: currentBody,
    setBody: updateTabBody,
    bodyRef: { current: currentBody },
    requestBody: '',
    requestBodyRef: { current: '' },
    params: currentParams,
    setParams: updateTabParams,
    paramsRef: { current: currentParams },
    queryString: '',
    queryStringRef: { current: '' },
    requestNameForSave,
    setRequestNameForSave: setRequestNameForSaveWithTabUpdate,
    requestNameForSaveRef,
    activeRequestId,
    setActiveRequestId,
    activeRequestIdRef,
    headers,
    setHeaders: setHeadersWithTabUpdate,
    headersRef,
    addHeader,
    updateHeader,
    removeHeader,
    variableExtraction,
    setVariableExtraction: setVariableExtractionWithTabUpdate,
    variableExtractionRef,
    loadRequest: loadRequestIntoEditor,
    resetEditor,
  };

  const { executeSendRequest, handleSaveButtonClick } = useRequestExecution({
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
  });

  const handleCloseTab = useCallback(
    (id: string) => {
      tabs.closeTab(id);
      removeTabState(id);
    },
    [tabs, removeTabState],
  );

  const handleNewRequest = useCallback(() => {
    const newTab = tabs.openTab();
    updateTabEditorState(newTab.tabId, {
      body: [],
      params: [],
    });
    resetEditor();
    setActiveRequestId(null);
    resetApiResponse();
  }, [tabs, updateTabEditorState, resetEditor, setActiveRequestId, resetApiResponse]);

  const handleLoadRequest = useCallback(
    (req: SavedRequest) => {
      const existing = tabs.tabs.find((t) => t.requestId === req.id);
      if (existing) {
        tabs.switchTab(existing.tabId);
        return;
      }

      const currentTab = tabs.getActiveTab();
      if (currentTab && currentTab.isDirty) {
        const confirmMessage = t('discard_changes_confirm', {
          defaultValue:
            'You have unsaved changes. Do you want to discard them and open the new request?',
        });
        if (!confirm(confirmMessage)) {
          return;
        }
      }

      const newTab = tabs.openTab(req);
      updateTabEditorState(newTab.tabId, {
        body: req.body || [],
        params: req.params || [],
      });

      loadRequestIntoEditor({
        id: req.id,
        name: req.name,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        params: req.params,
        variableExtraction: req.variableExtraction,
      });
      setActiveRequestId(req.id);
    },
    [tabs, t, updateTabEditorState, loadRequestIntoEditor, setActiveRequestId],
  );

  const handleDeleteRequest = useCallback(
    (idToDelete: string) => {
      if (confirm(t('delete_confirm'))) {
        deleteRequest(idToDelete);
        const tab = tabs.tabs.find((t) => t.requestId === idToDelete);
        if (tab) {
          handleCloseTab(tab.tabId);
        }
        if (activeRequestId === idToDelete) {
          resetEditor();
          resetApiResponse();
        }
      }
    },
    [deleteRequest, activeRequestId, resetEditor, resetApiResponse, tabs, handleCloseTab, t],
  );

  const handleCopyRequest = useCallback(
    (id: string) => {
      copyRequest(id);
    },
    [copyRequest],
  );

  const handleCopyFolder = useCallback(
    (id: string) => {
      copyFolder(id);
    },
    [copyFolder],
  );

  const handleTabSwitch = useCallback(
    (tabId: string) => {
      const tab = tabs.tabs.find((t) => t.tabId === tabId);
      if (!tab) return;

      isSwitchingTabRef.current = true;
      const existingState = getTabEditorState(tabId);

      if (tab.requestId) {
        const req = savedRequests.find((r) => r.id === tab.requestId);
        if (req) {
          if (!existingState) {
            loadRequestIntoEditor({
              id: req.id,
              name: req.name,
              method: req.method,
              url: req.url,
              headers: req.headers,
              body: req.body,
              params: req.params,
              variableExtraction: req.variableExtraction,
            });
            updateTabEditorState(tab.tabId, {
              body: req.body || [],
              params: req.params || [],
            });
          } else {
            setBody(existingState.body);
            setParams(existingState.params);
            setUrl(existingState.url || req.url);
            setMethod(existingState.method || req.method);
            setHeaders(existingState.headers || req.headers || []);
            setVariableExtraction(existingState.variableExtraction || req.variableExtraction);
          }
          setRequestNameForSave(existingState?.requestNameForSave || req.name);
          setActiveRequestId(req.id);
        }
      } else {
        if (!existingState) {
          resetEditor();
          setRequestNameForSave('Untitled Request');
          setActiveRequestId(null);
          updateTabEditorState(tab.tabId, {
            body: [],
            params: [],
          });
        } else {
          setBody(existingState.body);
          setParams(existingState.params);
          if (existingState.url !== undefined) setUrl(existingState.url);
          if (existingState.method !== undefined) setMethod(existingState.method);
          if (existingState.headers !== undefined) setHeaders(existingState.headers);
          if (existingState.requestNameForSave !== undefined)
            setRequestNameForSave(existingState.requestNameForSave);
          if (existingState.variableExtraction !== undefined)
            setVariableExtraction(existingState.variableExtraction);
        }
      }

      const savedResponse = getTabResponse(tabId);
      if (savedResponse) {
        setApiResponseState(savedResponse);
      } else {
        resetApiResponse();
      }

      setTimeout(() => {
        isSwitchingTabRef.current = false;
      }, 0);
    },
    [
      tabs.tabs,
      isSwitchingTabRef,
      getTabEditorState,
      getTabResponse,
      savedRequests,
      loadRequestIntoEditor,
      updateTabEditorState,
      setBody,
      setParams,
      setUrl,
      setMethod,
      setHeaders,
      setVariableExtraction,
      setRequestNameForSave,
      setActiveRequestId,
      resetEditor,
      setApiResponseState,
      resetApiResponse,
    ],
  );

  // Save response state when it changes
  React.useEffect(() => {
    const id = tabs.activeTabId;
    if (!id || isSwitchingTabRef.current) return;

    if (response || error || responseTime !== null) {
      saveTabResponse(id, { response, error, responseTime });
    }
  }, [tabs.activeTabId, response, error, responseTime, saveTabResponse, isSwitchingTabRef]);

  // Handle tab switching
  React.useEffect(() => {
    if (tabs.activeTabId) {
      handleTabSwitch(tabs.activeTabId);
    } else {
      resetEditor();
      setRequestNameForSave('Untitled Request');
      setActiveRequestId(null);
      resetApiResponse();
    }
  }, [tabs.activeTabId]);

  useKeyboardShortcuts({
    onSave: handleSaveButtonClick,
    onSend: executeSendRequest,
    onNew: handleNewRequest,
    onNextTab: () => tabs.nextTab(),
    onPrevTab: () => tabs.prevTab(),
    onCloseTab: () => {
      const active = tabs.getActiveTab();
      if (active) {
        handleCloseTab(active.tabId);
      }
    },
  });

  const onEditorStateRestore = useCallback(
    (state: any) => {
      if (state.body) setBody(state.body);
      if (state.params) setParams(state.params);
      if (state.url !== undefined) setUrl(state.url);
      if (state.method !== undefined) setMethod(state.method);
      if (state.headers !== undefined) setHeaders(state.headers);
      if (state.requestNameForSave !== undefined) setRequestNameForSave(state.requestNameForSave);
      if (state.variableExtraction !== undefined) setVariableExtraction(state.variableExtraction);
    },
    [
      setBody,
      setParams,
      setUrl,
      setMethod,
      setHeaders,
      setRequestNameForSave,
      setVariableExtraction,
    ],
  );

  const tabBarContent = tabs.tabs.length > 0 && (
    <TabBar
      tabs={tabs.tabs}
      activeTabId={tabs.activeTabId}
      onSelect={(id) => tabs.switchTab(id)}
      onClose={handleCloseTab}
      onNew={handleNewRequest}
      onReorder={(activeId, overId) => tabs.reorderTabs(activeId, overId)}
    />
  );

  return (
    <>
      <StateSync
        activeTabId={tabs.activeTabId}
        savedRequests={savedRequests}
        tabEditorStates={tabEditorStates}
        isSwitchingTabRef={isSwitchingTabRef}
        requestEditor={requestEditor}
        response={response}
        variableExtraction={variableExtraction}
        onTabStateUpdate={updateTabEditorState}
        onEditorStateRestore={onEditorStateRestore}
        onResponseStateRestore={setApiResponseState}
      />
      <AppLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        savedRequests={savedRequests}
        savedFolders={savedFolders}
        activeRequestId={activeRequestId}
        onLoadRequest={handleLoadRequest}
        onDeleteRequest={handleDeleteRequest}
        onCopyRequest={handleCopyRequest}
        onAddFolder={(parentId) => {
          addFolder({
            name: 'New Folder',
            parentFolderId: parentId,
            requestIds: [],
          });
        }}
        onAddRequest={(parentId) => {
          setNewRequestFolderId(parentId);
          handleNewRequest();
        }}
        onDeleteFolder={(id) => {
          if (confirm(t('delete_folder_confirm'))) deleteFolderRecursive(id);
        }}
        onCopyFolder={handleCopyFolder}
        moveRequest={moveRequest}
        moveFolder={moveFolder}
        tabBarContent={tabBarContent}
        hasActiveTabs={tabs.tabs.length > 0}
        editorPanelRef={editorPanelRef}
        requestNameForSave={requestNameForSave}
        onRequestNameForSaveChange={setRequestNameForSave}
        method={method}
        onMethodChange={setMethod}
        url={url}
        onUrlChange={setUrl}
        initialBody={currentBody}
        initialParams={currentParams}
        onBodyPairsChange={updateTabBody}
        onParamPairsChange={updateTabParams}
        loading={loading}
        onSaveRequest={handleSaveButtonClick}
        onSendRequest={executeSendRequest}
        headers={headers}
        onAddHeader={addHeader}
        onUpdateHeader={updateHeader}
        onRemoveHeader={removeHeader}
        onReorderHeaders={setHeaders}
        variableExtraction={variableExtraction}
        onVariableExtractionChange={setVariableExtraction}
        response={response}
        error={error}
        responseTime={responseTime}
        saveToastOpen={saveToastOpen}
        setSaveToastOpen={setSaveToastOpen}
        variablesPanelOpen={variablesPanelOpen}
        setVariablesPanelOpen={setVariablesPanelOpen}
        onNewRequest={handleNewRequest}
      />
    </>
  );
}
