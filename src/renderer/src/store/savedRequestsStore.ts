import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SavedRequest, SavedFolder, KeyValuePair } from '../types';

export interface SavedRequestsState {
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  addRequest: (req: Omit<SavedRequest, 'id'>) => string;
  updateRequest: (id: string, updated: Partial<Omit<SavedRequest, 'id'>>) => void;
  deleteRequest: (id: string) => void;
  copyRequest: (id: string) => string;
  setRequests: (reqs: SavedRequest[]) => void;
  addFolder: (folder: Omit<SavedFolder, 'id'>) => string;
  updateFolder: (id: string, updated: Partial<Omit<SavedFolder, 'id'>>) => void;
  deleteFolder: (id: string) => void;
  setFolders: (folders: SavedFolder[]) => void;
  moveRequestToFolder: (requestId: string, folderId: string | null) => void;
  moveFolderToFolder: (folderId: string, targetFolderId: string | null) => void;
}

const LOCAL_STORAGE_KEY = 'reqx_saved_requests';

const migrateRequests = (stored: unknown): SavedRequest[] => {
  if (!stored || typeof stored !== 'object') return [];
  try {
    const list = (stored as { savedRequests?: unknown }).savedRequests ?? stored;
    if (!Array.isArray(list)) return [];
    return (list as Array<Partial<SavedRequest> & { body?: unknown }>).map((req) => {
      let bodyPairs: KeyValuePair[] | undefined = Array.isArray(req.body)
        ? (req.body as KeyValuePair[])
        : undefined;
      const legacyBody = Array.isArray(
        (req as Partial<SavedRequest> & { bodyKeyValuePairs?: unknown }).bodyKeyValuePairs,
      )
        ? ((req as Partial<SavedRequest> & { bodyKeyValuePairs?: unknown })
            .bodyKeyValuePairs as KeyValuePair[])
        : undefined;

      if (!bodyPairs) {
        if (legacyBody) {
          bodyPairs = legacyBody;
        } else if (typeof req.body === 'string') {
          try {
            const parsed = JSON.parse(req.body);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
              bodyPairs = Object.entries(parsed).map(([k, v], i) => ({
                id: `kv-migrated-${k}-${i}-${Date.now()}`,
                keyName: k,
                value: typeof v === 'string' ? v : JSON.stringify(v, null, 2),
                enabled: true,
              }));
            } else {
              bodyPairs = [];
            }
          } catch {
            bodyPairs = [];
          }
        } else {
          bodyPairs = [];
        }
      }

      return {
        ...req,
        id: req.id || `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: req.name || 'Untitled Request',
        method: req.method || 'GET',
        url: req.url || '',
        headers: req.headers || [],
        body: bodyPairs || legacyBody || [],
        params: Array.isArray((req as SavedRequest).params)
          ? ((req as SavedRequest).params as KeyValuePair[])
          : [],
      } as SavedRequest;
    });
  } catch {
    return [];
  }
};

const migrateFolders = (stored: unknown): SavedFolder[] => {
  if (!stored || typeof stored !== 'object') return [];
  try {
    const list = (stored as { savedFolders?: unknown }).savedFolders ?? [];
    if (!Array.isArray(list)) return [];
    return (list as Array<Partial<SavedFolder>>).map((f) => ({
      id: f.id || `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: f.name || 'Untitled Folder',
      parentFolderId:
        typeof (f as SavedFolder).parentFolderId === 'string'
          ? (f as SavedFolder).parentFolderId
          : null,
      requestIds: Array.isArray(f.requestIds)
        ? (f.requestIds.filter((id) => typeof id === 'string') as string[])
        : [],
      subFolderIds: Array.isArray((f as SavedFolder).subFolderIds)
        ? ((f as SavedFolder).subFolderIds.filter((id) => typeof id === 'string') as string[])
        : [],
    }));
  } catch {
    return [];
  }
};

export const useSavedRequestsStore = create<SavedRequestsState>()(
  persist(
    (set, get) => ({
      savedRequests: [],
      savedFolders: [],
      addRequest: (req) => {
        const newId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const bodyPairs = req.body ?? [];
        const paramPairs = req.params ?? [];
        const newReq: SavedRequest = {
          ...req,
          id: newId,
          headers: req.headers || [],
          body: bodyPairs,
          params: paramPairs,
        };
        set({ savedRequests: [...get().savedRequests, newReq] });
        return newId;
      },
      updateRequest: (id, updated) => {
        set({
          savedRequests: get().savedRequests.map((r) => {
            if (r.id !== id) return r;
            const bodyPairs = updated.body ?? r.body;
            const paramPairs = updated.params ?? r.params;
            return { ...r, ...updated, body: bodyPairs, params: paramPairs };
          }),
        });
      },
      deleteRequest: (id) => {
        set({ savedRequests: get().savedRequests.filter((r) => r.id !== id) });
      },
      copyRequest: (id) => {
        const original = get().savedRequests.find((r) => r.id === id);
        if (!original) return '';
        const newId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const copy: SavedRequest = {
          ...original,
          id: newId,
          name: `${original.name} copy`,
        };
        set({ savedRequests: [...get().savedRequests, copy] });
        return newId;
      },
      setRequests: (reqs) => set({ savedRequests: reqs }),
      addFolder: (folder) => {
        const newId = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newFolder: SavedFolder = {
          ...folder,
          id: newId,
          parentFolderId: folder.parentFolderId ?? null,
          requestIds: folder.requestIds ?? [],
          subFolderIds: folder.subFolderIds ?? [],
        };
        set((state) => {
          let folders = state.savedFolders.map((f) =>
            f.id === newFolder.parentFolderId
              ? { ...f, subFolderIds: [...f.subFolderIds, newId] }
              : f,
          );
          folders = [...folders, newFolder];
          return { savedFolders: folders };
        });
        return newId;
      },
      updateFolder: (id, updated) => {
        set({
          savedFolders: get().savedFolders.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ...updated,
                  parentFolderId: updated.parentFolderId ?? f.parentFolderId,
                  requestIds: updated.requestIds ?? f.requestIds,
                  subFolderIds: updated.subFolderIds ?? f.subFolderIds,
                }
              : f,
          ),
        });
      },
      deleteFolder: (id) => {
        set((state) => {
          const target = state.savedFolders.find((f) => f.id === id);
          if (!target) return { savedFolders: state.savedFolders };
          let folders = state.savedFolders
            .filter((f) => f.id !== id)
            .map((f) => ({
              ...f,
              subFolderIds: f.subFolderIds.filter((sub) => sub !== id),
            }));
          folders = folders.map((f) =>
            target.subFolderIds.includes(f.id) ? { ...f, parentFolderId: null } : f,
          );
          return { savedFolders: folders };
        });
      },
      setFolders: (folders) => set({ savedFolders: folders }),
      moveRequestToFolder: (requestId, folderId) => {
        set((state) => {
          let folders = state.savedFolders.map((f) => ({
            ...f,
            requestIds: f.requestIds.filter((id) => id !== requestId),
          }));
          if (folderId) {
            folders = folders.map((f) =>
              f.id === folderId ? { ...f, requestIds: [...f.requestIds, requestId] } : f,
            );
          }
          return { savedFolders: folders };
        });
      },
      moveFolderToFolder: (folderId, targetFolderId) => {
        set((state) => {
          let folders = state.savedFolders.map((f) => ({
            ...f,
            subFolderIds: f.subFolderIds.filter((sub) => sub !== folderId),
          }));
          const idx = folders.findIndex((f) => f.id === folderId);
          if (idx === -1) return { savedFolders: folders };
          folders[idx] = { ...folders[idx], parentFolderId: targetFolderId };
          if (targetFolderId) {
            folders = folders.map((f) =>
              f.id === targetFolderId ? { ...f, subFolderIds: [...f.subFolderIds, folderId] } : f,
            );
          }
          return { savedFolders: folders };
        });
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (_persisted, current) => {
        const migratedReqs = migrateRequests(_persisted);
        const migratedFolders = migrateFolders(_persisted);
        return {
          ...current,
          savedRequests: migratedReqs,
          savedFolders: migratedFolders,
        } as SavedRequestsState;
      },
    },
  ),
);
