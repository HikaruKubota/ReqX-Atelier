import React, { useEffect, useCallback } from 'react';
import { TabBar } from '../components/organisms/TabBar';
import { useTabs } from '../hooks/useTabs';
import { useTabState } from '../hooks/useTabState';
import type { SavedRequest } from '../types';
import { useTranslation } from 'react-i18next';

interface TabManagerProps {
  savedRequests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onNewRequest: () => void;
  onTabSwitch: (tabId: string) => void;
  requestEditor: any;
  resetEditor: () => void;
  resetApiResponse: () => void;
  setActiveRequestId: (id: string | null) => void;
  setRequestNameForSave: (name: string) => void;
  loadRequestIntoEditor: (request: any) => void;
  response: any;
  error: any;
  responseTime: number | null;
}

export function TabManager({
  savedRequests,
  activeRequestId,
  onLoadRequest,
  onNewRequest,
  onTabSwitch,
  requestEditor,
  resetEditor,
  resetApiResponse,
  setActiveRequestId,
  setRequestNameForSave,
  loadRequestIntoEditor,
  response,
  error,
  responseTime,
}: TabManagerProps) {
  const { t } = useTranslation();
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

  const handleCloseTab = useCallback(
    (id: string) => {
      tabs.closeTab(id);
      removeTabState(id);
    },
    [tabs, removeTabState],
  );

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
      const targetTabId = newTab.tabId;

      updateTabEditorState(targetTabId, {
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

  const handleTabSwitch = useCallback(
    (tabId: string) => {
      tabs.switchTab(tabId);
      onTabSwitch(tabId);
    },
    [tabs, onTabSwitch],
  );

  // Save response state when response changes (but not when switching tabs)
  const prevActiveTabIdRef = React.useRef(tabs.activeTabId);
  useEffect(() => {
    const id = tabs.activeTabId;
    if (!id) return;

    const tabChanged = prevActiveTabIdRef.current !== id;
    prevActiveTabIdRef.current = id;

    if (!tabChanged && (response || error || responseTime !== null)) {
      saveTabResponse(id, { response, error, responseTime });
    }
  }, [tabs.activeTabId, response, error, responseTime, saveTabResponse]);

  // Restore response state when switching tabs
  useEffect(() => {
    const id = tabs.activeTabId;

    if (!id) {
      resetApiResponse();
      return;
    }

    const saved = getTabResponse(id);
    if (saved) {
      // This should be handled by the parent component
      // We'll pass this data up through onTabSwitch
    } else {
      resetApiResponse();
    }
  }, [tabs.activeTabId, getTabResponse, resetApiResponse]);

  return (
    <>
      {tabs.tabs.length > 0 && (
        <TabBar
          tabs={tabs.tabs}
          activeTabId={tabs.activeTabId}
          onSelect={handleTabSwitch}
          onClose={handleCloseTab}
          onNew={handleNewRequest}
          onReorder={(activeId, overId) => tabs.reorderTabs(activeId, overId)}
        />
      )}
    </>
  );
}

export { useTabs, useTabState };
export type { TabEditorState, TabResponseState } from '../hooks/useTabState';
