import { useEffect, useCallback, useRef } from 'react';
import type { SavedRequest, ApiResult, VariableExtraction } from '../types';
import type { TabEditorState, TabResponseState } from '../hooks/useTabState';
import { useUrlParamsSync } from '../hooks/useUrlParamsSync';
import { extractVariablesFromResponse, applyExtractedVariables } from '../utils/variableExtraction';

interface StateSyncProps {
  activeTabId: string | null;
  savedRequests: SavedRequest[];
  tabEditorStates: Record<string, TabEditorState>;
  isSwitchingTabRef: React.RefObject<boolean>;
  requestEditor: {
    url: string;
    body: any[];
    params: any[];
  };
  response: ApiResult | null;
  variableExtraction: VariableExtraction | undefined;
  onTabStateUpdate: (tabId: string, state: Partial<TabEditorState>) => void;
  onEditorStateRestore: (state: TabEditorState) => void;
  onResponseStateRestore: (state: TabResponseState) => void;
}

export function StateSync({
  activeTabId,
  savedRequests,
  tabEditorStates,
  isSwitchingTabRef,
  requestEditor,
  response,
  variableExtraction,
  onTabStateUpdate,
  onEditorStateRestore,
  onResponseStateRestore,
}: StateSyncProps) {
  const prevActiveTabIdRef = useRef(activeTabId);

  // Execute variable extraction when response is received
  useEffect(() => {
    if (response && variableExtraction && activeTabId) {
      const results = extractVariablesFromResponse(response, variableExtraction);
      if (results.length > 0) {
        applyExtractedVariables(results);
      }
    }
  }, [response, variableExtraction, activeTabId]);

  // URL params synchronization
  const currentTabEditorState = activeTabId ? tabEditorStates[activeTabId] : undefined;
  const currentBody = currentTabEditorState?.body || requestEditor.body;
  const currentParams = currentTabEditorState?.params || requestEditor.params;

  const updateTabUrl = useCallback(
    (newUrl: string) => {
      if (!activeTabId) return;
      onTabStateUpdate(activeTabId, { url: newUrl });
    },
    [activeTabId, onTabStateUpdate],
  );

  const updateTabParams = useCallback(
    (newParams: typeof requestEditor.params) => {
      if (!activeTabId) return;
      onTabStateUpdate(activeTabId, { params: newParams });
    },
    [activeTabId, onTabStateUpdate],
  );

  useUrlParamsSync({
    url: requestEditor.url,
    params: currentParams,
    onUrlChange: updateTabUrl,
    onParamsChange: updateTabParams,
    skipSync: isSwitchingTabRef.current,
  });

  // Sync tab state changes
  useEffect(() => {
    if (!activeTabId) return;

    const tabChanged = prevActiveTabIdRef.current !== activeTabId;
    prevActiveTabIdRef.current = activeTabId;

    if (tabChanged) {
      // Restore state when switching tabs
      const existingState = tabEditorStates[activeTabId];
      if (existingState) {
        onEditorStateRestore(existingState);
      }
    }
  }, [activeTabId, tabEditorStates, onEditorStateRestore]);

  return null;
}
