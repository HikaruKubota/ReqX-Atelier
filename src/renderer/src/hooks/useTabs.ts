import { useState } from 'react';
import type { KeyValuePair, RequestHeader, SavedRequest } from '../types';

export interface TabState {
  tabId: string;
  requestId: string | null;
  name: string;
  method: string;
  url: string;
  headers: RequestHeader[];
  bodyKeyValuePairs: KeyValuePair[];
}

const createTabState = (req?: SavedRequest): TabState => ({
  tabId: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  requestId: req?.id ?? null,
  name: req?.name ?? 'Untitled Request',
  method: req?.method ?? 'GET',
  url: req?.url ?? '',
  headers: req?.headers ?? [],
  bodyKeyValuePairs: req?.bodyKeyValuePairs ?? [],
});

export const useTabs = () => {
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = (req?: SavedRequest): TabState => {
    const newTab = createTabState(req);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.tabId);
    return newTab;
  };

  const closeTab = (tabId: string) => {
    setTabs((prev) => prev.filter((t) => t.tabId !== tabId));
    if (activeTabId === tabId) {
      const idx = tabs.findIndex((t) => t.tabId === tabId);
      const next = tabs[idx + 1] || tabs[idx - 1] || null;
      setActiveTabId(next ? next.tabId : null);
    }
  };

  const switchTab = (tabId: string) => setActiveTabId(tabId);

  const updateTab = (tabId: string, data: Partial<Omit<TabState, 'tabId'>>) => {
    setTabs((prev) =>
      prev.map((t) => (t.tabId === tabId ? { ...t, ...data } : t)),
    );
  };

  const getActiveTab = (): TabState | null =>
    tabs.find((t) => t.tabId === activeTabId) || null;

  const nextTab = () => {
    if (tabs.length <= 1 || !activeTabId) return;
    const idx = tabs.findIndex((t) => t.tabId === activeTabId);
    const next = tabs[(idx + 1) % tabs.length];
    setActiveTabId(next.tabId);
  };

  const prevTab = () => {
    if (tabs.length <= 1 || !activeTabId) return;
    const idx = tabs.findIndex((t) => t.tabId === activeTabId);
    const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
    setActiveTabId(prev.tabId);
  };

  return {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    switchTab,
    updateTab,
    getActiveTab,
    nextTab,
    prevTab,
  };
};
