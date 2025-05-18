import type { SavedRequest } from '../types';
import type { TabState } from '../hooks/useTabs';
import { deepEqual } from './deepEqual';

export const isTabUnsaved = (tab: TabState, savedRequests: SavedRequest[]): boolean => {
  if (!tab.requestId) return true;
  const saved = savedRequests.find((r) => r.id === tab.requestId);
  if (!saved) return true;
  if (
    tab.name !== saved.name ||
    tab.method !== saved.method ||
    tab.url !== saved.url ||
    !deepEqual(tab.headers, saved.headers || []) ||
    !deepEqual(tab.bodyKeyValuePairs, saved.bodyKeyValuePairs || [])
  ) {
    return true;
  }
  return false;
};
