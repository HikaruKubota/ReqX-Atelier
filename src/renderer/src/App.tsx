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

  // Saved requests state (from useSavedRequests hook)
  const {
    savedRequests,
    savedFolders,
    addRequest,
    updateRequest: updateSavedRequest,
    deleteRequest,
    copyRequest,
    addFolder,
    moveRequestToFolder,
    reorderRequests,
    reorderFolderRequests,
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
    const tab = tabs.openTab();
    loadRequestIntoEditor({
      id: tab.requestId || '',
      name: tab.name,
      method: tab.method,
      url: tab.url,
      headers: tab.headers,
      body: tab.body,
      params: tab.params,
    });
    setActiveRequestId(null);
    resetApiResponse();
  }, [tabs, loadRequestIntoEditor, setActiveRequestId, resetApiResponse]);

  // 初回起動時にタブを自動生成せず、ショートカットボードを表示したままにする
  // useEffect(() => {
  //   if (tabs.tabs.length === 0) {
  //     handleNewRequest();
  //   }
  // }, []);

  const handleSaveButtonClick = useCallback(() => {
    executeSaveRequest();
    setSaveToastOpen(true);
    const activeTab = tabs.getActiveTab();
    if (activeTab) {
      tabs.updateTab(activeTab.tabId, {
        name:
          requestNameForSaveRef.current.trim() !== ''
            ? requestNameForSaveRef.current.trim()
            : 'Untitled Request',
        method,
        url,
        headers,
        body: body,
        params,
        requestId: activeRequestIdRef.current,
      });
    }
  }, [
    executeSaveRequest,
    tabs,
    method,
    url,
    headers,
    body,
    requestNameForSaveRef,
    activeRequestIdRef,
  ]);

  useKeyboardShortcuts({
    onSave: handleSaveButtonClick,
    onSend: executeSendRequest,
    onNew: handleNewRequest,
    onNextTab: () => {
      const active = tabs.getActiveTab();
      if (active) {
        tabs.updateTab(active.tabId, {
          name: requestNameForSave,
          method,
          url,
          headers,
          body: body,
          params,
          requestId: activeRequestId,
        });
      }
      tabs.nextTab();
    },
    onPrevTab: () => {
      const active = tabs.getActiveTab();
      if (active) {
        tabs.updateTab(active.tabId, {
          name: requestNameForSave,
          method,
          url,
          headers,
          body: body,
          params,
          requestId: activeRequestId,
        });
      }
      tabs.prevTab();
    },
    onCloseTab: () => {
      const active = tabs.getActiveTab();
      if (active) {
        tabs.closeTab(active.tabId);
      }
    },
  });

  const handleLoadRequest = (req: SavedRequest) => {
    const active = tabs.getActiveTab();
    if (active) {
      tabs.updateTab(active.tabId, {
        name: requestNameForSave,
        method,
        url,
        headers,
        body: body,
        params,
        requestId: activeRequestId,
      });
    }

    const existing = tabs.tabs.find((t) => t.requestId === req.id);
    let target = existing;
    if (!existing) {
      target = tabs.openTab(req);
    } else {
      tabs.switchTab(existing.tabId);
    }
    if (target) {
      loadRequestIntoEditor({
        id: target.requestId || '',
        name: target.name,
        method: target.method,
        url: target.url,
        headers: target.headers,
        body: target.body,
        params: target.params,
      });
      setActiveRequestId(target.requestId);
    }
    resetApiResponse();
  };

  useEffect(() => {
    const tab = tabs.getActiveTab();
    if (tab) {
      loadRequestIntoEditor({
        id: tab.requestId || '',
        name: tab.name,
        method: tab.method,
        url: tab.url,
        headers: tab.headers,
        body: tab.body,
        params: tab.params,
      });
      setRequestNameForSave(tab.name);
      setActiveRequestId(tab.requestId);
      resetApiResponse();
    }
  }, [tabs.activeTabId]);

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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <RequestCollectionSidebar
        savedRequests={savedRequests}
        savedFolders={savedFolders}
        activeRequestId={activeRequestId}
        onLoadRequest={handleLoadRequest}
        onDeleteRequest={handleDeleteRequest}
        onCopyRequest={handleCopyRequest}
        onAddFolder={() => {
          addFolder({
            name: t('untitled_folder'),
            parentFolderId: null,
            requestIds: [],
            subFolderIds: [],
          });
        }}
        onMoveRequest={moveRequestToFolder}
        onReorderRoot={reorderRequests}
        onReorderFolder={reorderFolderRequests}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Right Main Area for Request Editing and Response */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tabs.tabs.length > 0 && (
          <TabBar
            tabs={tabs.tabs.map(({ tabId, name, method }) => ({ tabId, name, method }))}
            activeTabId={tabs.activeTabId}
            onSelect={(id) => {
              const active = tabs.getActiveTab();
              if (active) {
                tabs.updateTab(active.tabId, {
                  name: requestNameForSave,
                  method,
                  url,
                  headers,
                  body: body,
                  requestId: activeRequestId,
                });
              }
              tabs.switchTab(id);
            }}
            onClose={(id) => {
              tabs.closeTab(id);
            }}
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
