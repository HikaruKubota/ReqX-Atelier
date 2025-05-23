import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useSavedRequests } from './hooks/useSavedRequests';
import type { SavedRequest } from './types';
import { useRequestEditor } from './hooks/useRequestEditor'; // Import the new hook and RequestHeader
import { useApiResponseHandler } from './hooks/useApiResponseHandler'; // Import the new API response handler hook
import { RequestCollectionSidebar } from './components/RequestCollectionSidebar'; // Import the new sidebar component
import { RequestEditorPanel } from './components/RequestEditorPanel'; // Import the new editor panel component and ref type
import { ResponseDisplayPanel } from './components/ResponseDisplayPanel'; // Import the new response panel component
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabs } from './hooks/useTabs';
import { useRequestActions } from './hooks/useRequestActions';
import { useTranslation } from 'react-i18next';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { TabBar } from './components/organisms/TabBar';
import { ShortcutsGuide } from './components/organisms/ShortcutsGuide';
import { RequestEditorPanelRef } from './types'; // Import the RequestHeader type
import { Toast } from './components/atoms/toast/Toast';

export default function App() {
  const { t } = useTranslation();
  const editorPanelRef = useRef<RequestEditorPanelRef>(null); // Create a ref
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveToastOpen, setSaveToastOpen] = useState(false);

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
    loadRequest: loadRequestIntoEditor, // Renamed to avoid conflict if there was a local var named loadRequest
    resetEditor,
  } = useRequestEditor();

  // Use the new API response handler hook
  const { response, error, loading, responseTime, executeRequest, resetApiResponse } =
    useApiResponseHandler();

  const [newRequestFolderId, setNewRequestFolderId] = useState<string | null>(null);

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

  const { executeSendRequest, executeSaveRequest } = useRequestActions({
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
  });

  const tabs = useTabs();

  const handleNewRequest = useCallback(() => {
    tabs.openTab();
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
        tabs.closeTab(active.tabId);
      }
    },
  });

  const handleLoadRequest = (req: SavedRequest) => {
    const existing = tabs.tabs.find((t) => t.requestId === req.id);
    if (existing) {
      tabs.switchTab(existing.tabId);
    } else {
      tabs.openTab(req);
    }
    loadRequestIntoEditor({
      id: req.id,
      name: req.name,
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
    });
    setActiveRequestId(req.id);
    resetApiResponse();
  };

  useEffect(() => {
    const tab = tabs.getActiveTab();
    if (!tab) return;

    if (tab.requestId) {
      const req = savedRequests.find((r) => r.id === tab.requestId);
      if (req) {
        loadRequestIntoEditor({
          id: req.id,
          name: req.name,
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          params: req.params,
        });
        setRequestNameForSave(req.name);
        setActiveRequestId(req.id);
      }
    } else {
      // 新規タブ
      resetEditor();
      setRequestNameForSave('Untitled Request');
      setActiveRequestId(null);
    }
    resetApiResponse();
  }, [tabs.activeTabId, savedRequests]);

  const handleDeleteRequest = useCallback(
    (idToDelete: string) => {
      if (confirm(t('delete_confirm'))) {
        deleteRequest(idToDelete);
        const tab = tabs.tabs.find((t) => t.requestId === idToDelete);
        if (tab) {
          tabs.closeTab(tab.tabId);
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
            subFolderIds: [],
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
            onClose={(id) => tabs.closeTab(id)}
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
          <div style={{ alignSelf: 'flex-end' }}>
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
                initialBody={body}
                initialParams={params}
                onBodyPairsChange={setBody}
                onParamPairsChange={setParams}
                activeRequestId={activeRequestId}
                loading={loading}
                onSaveRequest={handleSaveButtonClick}
                onSendRequest={executeSendRequest}
                headers={headers}
                onAddHeader={addHeader}
                onUpdateHeader={updateHeader}
                onRemoveHeader={removeHeader}
                onReorderHeaders={setHeaders}
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
    </div>
  );
}
