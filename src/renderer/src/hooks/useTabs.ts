import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { KeyValuePair, RequestHeader, SavedRequest } from '../types';

export interface TabState {
  tabId: string;
  requestId: string | null;
  name: string;
  method: string;
  url: string;
  headers: RequestHeader[];
  body: KeyValuePair[];
}

const createTabState = (req?: SavedRequest): TabState => ({
  tabId: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  requestId: req?.id ?? null,
  name: req?.name ?? 'Untitled Request',
  method: req?.method ?? 'GET',
  url: req?.url ?? '',
  headers: req?.headers ?? [],
  body: req?.body ?? [],
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
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.tabId === tabId);
      const newTabs = prev.filter((t) => t.tabId !== tabId);
      setActiveTabId((current) => {
        if (current !== tabId) return current;
        const next = newTabs[idx] || newTabs[idx - 1] || null;
        return next ? next.tabId : null;
      });
      return newTabs;
    });
  };

  const switchTab = (tabId: string) => setActiveTabId(tabId);

  const updateTab = (tabId: string, data: Partial<Omit<TabState, 'tabId'>>) => {
    setTabs((prev) => prev.map((t) => (t.tabId === tabId ? { ...t, ...data } : t)));
  };

  const getActiveTab = (): TabState | null => tabs.find((t) => t.tabId === activeTabId) || null;

  const nextTab = () => {
    setActiveTabId((current) => {
      if (tabs.length <= 1 || !current) return current;
      const idx = tabs.findIndex((t) => t.tabId === current);
      const next = tabs[(idx + 1) % tabs.length];
      return next.tabId;
    });
  };

  const prevTab = () => {
    setActiveTabId((current) => {
      if (tabs.length <= 1 || !current) return current;
      const idx = tabs.findIndex((t) => t.tabId === current);
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      return prev.tabId;
    });
  };

  const moveTab = (tabId: string, direction: -1 | 1) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.tabId === tabId);
      const newIndex = idx + direction;
      if (idx === -1 || newIndex < 0 || newIndex >= prev.length) return prev;
      const newTabs = [...prev];
      const [tab] = newTabs.splice(idx, 1);
      newTabs.splice(newIndex, 0, tab);
      return newTabs;
    });
  };

  const reorderTabs = (activeId: string, overId: string) => {
    setTabs((prev) => {
      const oldIndex = prev.findIndex((t) => t.tabId === activeId);
      const newIndex = prev.findIndex((t) => t.tabId === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const moveActiveTabRight = () => {
    if (activeTabId) {
      moveTab(activeTabId, 1);
    }
  };

  const moveActiveTabLeft = () => {
    if (activeTabId) {
      moveTab(activeTabId, -1);
    }
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
    moveActiveTabRight,
    moveActiveTabLeft,
    reorderTabs,
  };
};
