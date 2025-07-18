import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useSavedRequests } from './hooks/useSavedRequests';
import type {
  SavedRequest,
  ApiResult,
  ApiError,
  KeyValuePair,
  RequestHeader,
  VariableExtraction,
} from './types';
import { useRequestEditor } from './hooks/useRequestEditor'; // Import the new hook and RequestHeader
import { useApiResponseHandler } from './hooks/useApiResponseHandler'; // Import the new API response handler hook
import { RequestCollectionSidebar } from './components/RequestCollectionSidebar'; // Import the new sidebar component
import { RequestEditorPanel } from './components/RequestEditorPanel'; // Import the new editor panel component and ref type
import { ResponseDisplayPanel } from './components/ResponseDisplayPanel'; // Import the new response panel component
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabs } from './hooks/useTabs';
import { useRequestActions } from './hooks/useRequestActions';
import { useTabDirtyTracker } from './hooks/useTabDirtyTracker';
import { useTranslation } from 'react-i18next';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { TabBar } from './components/organisms/TabBar';
import { ShortcutsGuide } from './components/organisms/ShortcutsGuide';
import { RequestEditorPanelRef } from './types'; // Import the RequestHeader type
import { Toast } from './components/atoms/toast/Toast';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { VariablesButton } from './components/VariablesButton';
import { VariablesPanel } from './components/VariablesPanel';
import { extractVariablesFromResponse, applyExtractedVariables } from './utils/variableExtraction';
import { useUrlParamsSync } from './hooks/useUrlParamsSync';
import type { ParsedCurlRequest } from './utils/curlParser';

export default function App() {
  const { t } = useTranslation();
  const editorPanelRef = useRef<RequestEditorPanelRef>(null); // Create a ref
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveToastOpen, setSaveToastOpen] = useState(false);
  const [variablesPanelOpen, setVariablesPanelOpen] = useState(false);

  // Track if we're switching tabs to prevent sync issues
  const isSwitchingTabRef = useRef(false);

  // Use the new custom hook for request editor state and logic
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
    headersRef, // Destructure headers state and functions
    addHeader,
    updateHeader,
    removeHeader, // Destructure header actions
    variableExtraction,
    setVariableExtraction,
    variableExtractionRef,
    loadRequest: loadRequestIntoEditor, // Renamed to avoid conflict if there was a local var named loadRequest
    resetEditor,
  } = useRequestEditor();

  // Use the new API response handler hook
  const {
    response,
    error,
    loading,
    responseTime,
    executeRequest,
    resetApiResponse,
    setApiResponseState,
  } = useApiResponseHandler();

  const [newRequestFolderId, setNewRequestFolderId] = useState<string | null>(null);

  const [tabResponses, setTabResponses] = useState<
    Record<
      string,
      { response: ApiResult | null; error: ApiError | null; responseTime: number | null }
    >
  >({});

  // Tab-specific editor states
  const [tabEditorStates, setTabEditorStates] = useState<
    Record<
      string,
      {
        body: KeyValuePair[];
        params: KeyValuePair[];
        url?: string;
        method?: string;
        headers?: RequestHeader[];
        requestNameForSave?: string;
        variableExtraction?: VariableExtraction;
      }
    >
  >({});

  // Saved requests state (from useSavedRequests hook)
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

  // Execute variable extraction when response is received
  React.useEffect(() => {
    if (response && variableExtraction && tabs.activeTabId) {
      const results = extractVariablesFromResponse(response, variableExtraction);
      if (results.length > 0) {
        applyExtractedVariables(results);
      }
    }
  }, [response, variableExtraction, tabs.activeTabId]);

  // Get current tab's editor state
  const currentTabEditorState = tabs.activeTabId ? tabEditorStates[tabs.activeTabId] : undefined;
  const currentBody = currentTabEditorState?.body || body;
  const currentParams = currentTabEditorState?.params || params;

  // Update tab editor state when body or params change
  const updateTabBody = useCallback(
    (newBody: KeyValuePair[]) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;

      setTabEditorStates((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          body: newBody,
          params: prev[tabId]?.params || [],
        },
      }));
      setBody(newBody);
    },
    [tabs.activeTabId, setBody],
  );

  const updateTabParams = useCallback(
    (newParams: KeyValuePair[]) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;

      setTabEditorStates((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          body: prev[tabId]?.body || [],
          params: newParams,
        },
      }));
      setParams(newParams);
    },
    [tabs.activeTabId, setParams],
  );

  // Update tab URL when URL changes
  const updateTabUrl = useCallback(
    (newUrl: string) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;

      setTabEditorStates((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          url: newUrl,
        },
      }));
      setUrl(newUrl);
    },
    [tabs.activeTabId, setUrl],
  );

  // Use URL params synchronization
  useUrlParamsSync({
    url,
    params: currentParams,
    onUrlChange: updateTabUrl,
    onParamsChange: updateTabParams,
    skipSync: isSwitchingTabRef.current,
  });

  // Update tab state utility function
  const updateTabState = useCallback(
    (
      updates: Partial<{
        method: string;
        headers: RequestHeader[];
        requestNameForSave: string;
        variableExtraction: VariableExtraction | undefined;
        url: string;
      }>,
    ) => {
      const tabId = tabs.activeTabId;
      if (!tabId) return;

      setTabEditorStates((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          ...updates,
        },
      }));
    },
    [tabs.activeTabId],
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
    (val: RequestHeader[]) => {
      setHeaders(val);
      updateTabState({ headers: val });
    },
    [setHeaders, updateTabState],
  );

  const setVariableExtractionWithTabUpdate = useCallback(
    (val: VariableExtraction | undefined) => {
      setVariableExtraction(val);
      updateTabState({ variableExtraction: val });
    },
    [setVariableExtraction, updateTabState],
  );

  const handleCurlImport = useCallback(
    (parsedRequest: ParsedCurlRequest) => {
      // Update all form fields with parsed data
      setMethodWithTabUpdate(parsedRequest.method);
      updateTabUrl(parsedRequest.url);

      // Convert parsed headers to RequestHeader format
      const newHeaders: RequestHeader[] = parsedRequest.headers.map((header) => ({
        id: header.id,
        key: header.keyName,
        value: header.value,
        enabled: header.enabled,
      }));
      setHeadersWithTabUpdate(newHeaders);

      // Update body and params
      updateTabBody(parsedRequest.body);
      updateTabParams(parsedRequest.params);

      // Clear any existing response data
      resetApiResponse();
    },
    [
      setMethodWithTabUpdate,
      updateTabUrl,
      setHeadersWithTabUpdate,
      updateTabBody,
      updateTabParams,
      resetApiResponse,
    ],
  );

  // Helper function: Handle empty tab state
  const handleEmptyTabState = useCallback(() => {
    resetEditor();
    setRequestNameForSave('Untitled Request');
    setActiveRequestId(null);
    resetApiResponse();
  }, [resetEditor, setRequestNameForSave, setActiveRequestId, resetApiResponse]);

  // Helper function: Handle new tab without saved request
  const handleNewTabState = useCallback(
    (
      tab: { tabId: string; requestId?: string | null },
      existingState: (typeof tabEditorStates)[string] | undefined,
    ) => {
      if (!existingState) {
        resetEditor();
        setRequestNameForSave('Untitled Request');
        setActiveRequestId(null);

        // Initialize empty state for new tab
        setTabEditorStates((prev) => ({
          ...prev,
          [tab.tabId]: {
            body: [],
            params: [],
          },
        }));
      } else {
        // Use existing state
        setBody(existingState.body);
        setParams(existingState.params);
        // Restore other states for new tab
        if (existingState.url !== undefined) setUrl(existingState.url);
        if (existingState.method !== undefined) setMethod(existingState.method);
        if (existingState.headers !== undefined) setHeaders(existingState.headers);
        if (existingState.requestNameForSave !== undefined)
          setRequestNameForSave(existingState.requestNameForSave);
        if (existingState.variableExtraction !== undefined)
          setVariableExtraction(existingState.variableExtraction);
      }
    },
    [
      resetEditor,
      setRequestNameForSave,
      setActiveRequestId,
      setTabEditorStates,
      setBody,
      setParams,
      setUrl,
      setMethod,
      setHeaders,
      setVariableExtraction,
    ],
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

  const { resetDirtyState } = useTabDirtyTracker({
    tabId: tabs.activeTabId,
    requestEditor,
    markTabDirty: tabs.markTabDirty,
    markTabClean: tabs.markTabClean,
  });

  const { executeSendRequest, executeSaveRequest } = useRequestActions({
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
  });

  const handleCloseTab = useCallback(
    (id: string) => {
      tabs.closeTab(id);
      setTabResponses((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setTabEditorStates((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    },
    [tabs],
  );

  const handleNewRequest = useCallback(() => {
    const newTab = tabs.openTab();

    // Initialize empty state for new tab
    setTabEditorStates((prev) => ({
      ...prev,
      [newTab.tabId]: {
        body: [],
        params: [],
      },
    }));

    resetEditor();
    setActiveRequestId(null);
    resetApiResponse();
  }, [tabs, resetEditor, setActiveRequestId, resetApiResponse]);

  const handleSaveButtonClick = useCallback(() => {
    const activeTab = tabs.getActiveTab();
    if (!activeTab) return;

    const prevId = activeRequestIdRef.current;
    const savedId = executeSaveRequest();
    if (!savedId) return; // safeguard

    setSaveToastOpen(true);
    resetDirtyState(); // Reset dirty state after saving

    if (activeTab && !activeTab.requestId) {
      tabs.updateTab(activeTab.tabId, { requestId: savedId });
    }

    // If the request was just created inside a specific folder, add its ID there
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
  ]);

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

  // Save response state when response changes (but not when switching tabs)
  const prevActiveTabIdRef = useRef(tabs.activeTabId);
  useEffect(() => {
    const id = tabs.activeTabId;
    if (!id) return;

    // Only save if the tab hasn't changed (to avoid saving during tab switch)
    const tabChanged = prevActiveTabIdRef.current !== id;
    prevActiveTabIdRef.current = id;

    if (!tabChanged && (response || error || responseTime !== null)) {
      setTabResponses((prev) => ({
        ...prev,
        [id]: { response, error, responseTime },
      }));
    }
  }, [tabs.activeTabId, response, error, responseTime]);

  // Restore response state when switching tabs
  useEffect(() => {
    const id = tabs.activeTabId;

    if (!id) {
      resetApiResponse();
      return;
    }

    // Restore response state when switching tabs
    const saved = tabResponses[id];
    if (saved) {
      setApiResponseState(saved);
    } else {
      resetApiResponse();
    }
  }, [tabs.activeTabId]);

  const handleLoadRequest = (req: SavedRequest) => {
    const existing = tabs.tabs.find((t) => t.requestId === req.id);

    if (existing) {
      // If the tab exists, update its state with the latest request data
      setTabEditorStates((prev) => ({
        ...prev,
        [existing.tabId]: {
          body: req.body || [],
          params: req.params || [],
          url: req.url,
          method: req.method,
          headers: req.headers || [],
          requestNameForSave: req.name,
          variableExtraction: req.variableExtraction,
        },
      }));

      // Then switch to it
      tabs.switchTab(existing.tabId);
      return;
    }

    // Check if current tab has unsaved changes
    const currentTab = tabs.getActiveTab();
    if (currentTab && currentTab.isDirty) {
      // Show confirmation dialog
      const confirmMessage = t('discard_changes_confirm', {
        defaultValue:
          'You have unsaved changes. Do you want to discard them and open the new request?',
      });

      if (!confirm(confirmMessage)) {
        // User cancelled, don't load the new request
        return;
      }
    }

    // Open new tab with the request
    const newTab = tabs.openTab(req);
    const targetTabId = newTab.tabId;

    // Initialize tab editor state with request data
    setTabEditorStates((prev) => ({
      ...prev,
      [targetTabId]: {
        body: req.body || [],
        params: req.params || [],
        url: req.url,
        method: req.method,
        headers: req.headers || [],
        requestNameForSave: req.name,
        variableExtraction: req.variableExtraction,
      },
    }));

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
  };

  // Tab switching useEffect with safer state management
  useEffect(() => {
    const tab = tabs.getActiveTab();
    if (!tab) {
      handleEmptyTabState();
      return;
    }

    // Mark that we're switching tabs
    isSwitchingTabRef.current = true;

    // Check if we already have editor state for this tab
    const existingState = tabEditorStates[tab.tabId];

    if (tab.requestId) {
      const req = savedRequests.find((r) => r.id === tab.requestId);
      if (req) {
        // Only load request data if we don't have existing state
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

          // Initialize tab editor state
          setTabEditorStates((prev) => ({
            ...prev,
            [tab.tabId]: {
              body: req.body || [],
              params: req.params || [],
              url: req.url,
              method: req.method,
              headers: req.headers || [],
              requestNameForSave: req.name,
              variableExtraction: req.variableExtraction,
            },
          }));
        } else {
          // Use existing state
          setBody(existingState.body);
          setParams(existingState.params);
          // Restore other states from tab state or saved request
          setUrl(existingState.url || req.url);
          setMethod(existingState.method || req.method);
          setHeaders(existingState.headers || req.headers || []);
          setVariableExtraction(existingState.variableExtraction || req.variableExtraction);
        }

        setRequestNameForSave(existingState?.requestNameForSave || req.name);
        setActiveRequestId(req.id);
      }
    } else {
      // New tab
      handleNewTabState(tab, existingState);
    }

    // Reset the flag after all state updates are done
    setTimeout(() => {
      isSwitchingTabRef.current = false;
    }, 0);
  }, [tabs.activeTabId]);

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
    [deleteRequest, activeRequestId, resetEditor, resetApiResponse, tabs],
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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <RequestCollectionSidebar
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
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Right Main Area for Request Editing and Response */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tabs.tabs.length > 0 && (
          <TabBar
            tabs={tabs.tabs}
            activeTabId={tabs.activeTabId}
            onSelect={(id) => tabs.switchTab(id)}
            onClose={(id) => handleCloseTab(id)}
            onNew={handleNewRequest}
            onReorder={(activeId, overId) => tabs.reorderTabs(activeId, overId)}
          />
        )}
        <div
          style={{
            flexGrow: 1,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            overflowY: 'auto',
          }}
        >
          <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '10px' }}>
            <EnvironmentSelector />
            <VariablesButton onClick={() => setVariablesPanelOpen(true)} />
            <ThemeToggleButton />
          </div>
          {tabs.tabs.length === 0 ? (
            <ShortcutsGuide onNew={handleNewRequest} />
          ) : (
            <>
              <RequestEditorPanel
                ref={editorPanelRef}
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
                activeRequestId={activeRequestId}
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
                onCurlImport={handleCurlImport}
              />

              {/* Use the new ResponseDisplayPanel component */}
              <ResponseDisplayPanel
                response={response}
                error={error}
                loading={loading}
                responseTime={responseTime}
              />
            </>
          )}
        </div>
      </div>
      <Toast
        message={t('save_success')}
        isOpen={saveToastOpen}
        onClose={() => setSaveToastOpen(false)}
      />
      <VariablesPanel isOpen={variablesPanelOpen} onClose={() => setVariablesPanelOpen(false)} />
    </div>
  );
}
