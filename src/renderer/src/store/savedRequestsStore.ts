import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SavedRequest, KeyValuePair } from '../types';

const generateJsonFromPairs = (pairs: KeyValuePair[]): string => {
  if (pairs.length === 0) return '';
  try {
    const obj = pairs.reduce(
      (acc, p) => {
        if (p.enabled && p.keyName.trim() !== '') {
          try {
            acc[p.keyName] = JSON.parse(p.value);
          } catch {
            acc[p.keyName] = p.value;
          }
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
    return Object.keys(obj).length > 0 ? JSON.stringify(obj, null, 2) : '';
  } catch {
    return '';
  }
};

export interface SavedRequestsState {
  savedRequests: SavedRequest[];
  addRequest: (req: Omit<SavedRequest, 'id'>) => string;
  updateRequest: (id: string, updated: Partial<Omit<SavedRequest, 'id'>>) => void;
  deleteRequest: (id: string) => void;
  setRequests: (reqs: SavedRequest[]) => void;
}

const LOCAL_STORAGE_KEY = 'reqx_saved_requests';

const migrateRequests = (stored: unknown): SavedRequest[] => {
  if (!stored || typeof stored !== 'object') return [];
  try {
    const list = (stored as { savedRequests?: unknown }).savedRequests ?? stored;
    if (!Array.isArray(list)) return [];
    return (list as Array<Partial<SavedRequest> & { body?: string }>).map((req) => {
      let bodyKeyValuePairs = req.bodyKeyValuePairs as KeyValuePair[] | undefined;
      let bodyString = req.body as string | undefined;
      if (!bodyKeyValuePairs && bodyString) {
        try {
          const parsed = JSON.parse(bodyString);
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            bodyKeyValuePairs = Object.entries(parsed).map(([k, v], i) => ({
              id: `kv-migrated-${k}-${i}-${Date.now()}`,
              keyName: k,
              value: typeof v === 'string' ? v : JSON.stringify(v, null, 2),
              enabled: true,
            }));
          }
        } catch {
          bodyKeyValuePairs = [];
        }
      }
      if (!bodyString && bodyKeyValuePairs) {
        bodyString = generateJsonFromPairs(bodyKeyValuePairs);
      }
      return {
        ...req,
        id: req.id || `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: req.name || 'Untitled Request',
        method: req.method || 'GET',
        url: req.url || '',
        headers: req.headers || [],
        bodyKeyValuePairs: bodyKeyValuePairs || [],
        body: bodyString ?? '',
      } as SavedRequest;
    });
  } catch {
    return [];
  }
};

export const useSavedRequestsStore = create<SavedRequestsState>()(
  persist(
    (set, get) => ({
      savedRequests: [],
      addRequest: (req) => {
        const newId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newReq: SavedRequest = {
          ...req,
          id: newId,
          headers: req.headers || [],
          bodyKeyValuePairs: req.bodyKeyValuePairs || [],
          body: req.body ?? generateJsonFromPairs(req.bodyKeyValuePairs || []),
        };
        set({ savedRequests: [...get().savedRequests, newReq] });
        return newId;
      },
      updateRequest: (id, updated) => {
        set({
          savedRequests: get().savedRequests.map((r) => {
            if (r.id !== id) return r;
            const bodyText =
              updated.body ??
              (updated.bodyKeyValuePairs
                ? generateJsonFromPairs(updated.bodyKeyValuePairs)
                : r.body);
            return { ...r, ...updated, body: bodyText };
          }),
        });
      },
      deleteRequest: (id) => {
        set({ savedRequests: get().savedRequests.filter((r) => r.id !== id) });
      },
      setRequests: (reqs) => set({ savedRequests: reqs }),
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (_persisted, current) => {
        const migrated = migrateRequests(_persisted);
        return { ...current, savedRequests: migrated } as SavedRequestsState;
      },
    },
  ),
);
