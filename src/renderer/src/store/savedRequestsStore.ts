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
  copyFolder: (id: string) => string;
  setRequests: (reqs: SavedRequest[]) => void;
  addFolder: (folder: Omit<SavedFolder, 'id'>) => string;
  updateFolder: (id: string, updated: Partial<Omit<SavedFolder, 'id'>>) => void;
  deleteFolder: (id: string) => void;
  deleteFolderRecursive: (id: string) => void;
  moveRequest: (id: string, targetFolderId: string | null, index?: number) => void;
  moveFolder: (id: string, targetFolderId: string | null, index?: number) => void;
  setFolders: (folders: SavedFolder[]) => void;
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
      copyFolder: (id) => {
        const folders = get().savedFolders;
        const requests = get().savedRequests;
        const findFolder = (fid: string) => folders.find((f) => f.id === fid);
        const findRequest = (rid: string) => requests.find((r) => r.id === rid);
        const newFolders = [...folders];
        const newRequests = [...requests];

        const genFolderId = () =>
          `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const genRequestId = () =>
          `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const recursiveCopy = (
          srcId: string,
          destParentId: string | null,
          isRoot: boolean,
        ): string => {
          const srcFolder = findFolder(srcId);
          if (!srcFolder) return '';
          const newId = genFolderId();
          const folderCopy: SavedFolder = {
            ...srcFolder,
            id: newId,
            name: isRoot ? `${srcFolder.name} copy` : srcFolder.name,
            parentFolderId: destParentId,
            requestIds: [],
            subFolderIds: [],
          };
          newFolders.push(folderCopy);

          srcFolder.requestIds.forEach((rid) => {
            const req = findRequest(rid);
            if (req) {
              const newReqId = genRequestId();
              const reqCopy: SavedRequest = { ...req, id: newReqId };
              newRequests.push(reqCopy);
              folderCopy.requestIds.push(newReqId);
            }
          });

          srcFolder.subFolderIds.forEach((fid) => {
            const childId = recursiveCopy(fid, newId, false);
            if (childId) folderCopy.subFolderIds.push(childId);
          });

          return newId;
        };

        const newRootId = recursiveCopy(id, findFolder(id)?.parentFolderId ?? null, true);
        set({ savedFolders: newFolders, savedRequests: newRequests });
        return newRootId;
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
        set({ savedFolders: [...get().savedFolders, newFolder] });
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
        set({ savedFolders: get().savedFolders.filter((f) => f.id !== id) });
      },
      deleteFolderRecursive: (id) => {
        const recursiveDelete = (folderId: string) => {
          const folder = get().savedFolders.find((f) => f.id === folderId);
          if (!folder) return;
          folder.requestIds.forEach((rid) => get().deleteRequest(rid));
          folder.subFolderIds.forEach((fid) => recursiveDelete(fid));
          set({
            savedFolders: get().savedFolders.filter((f) => f.id !== folderId),
          });
        };
        recursiveDelete(id);
      },
      moveRequest: (id, targetFolderId, index) => {
        const folders = get().savedFolders.map((f) => {
          let reqIds = f.requestIds.filter((rid) => rid !== id);
          if (f.id === targetFolderId) {
            const insertAt = index !== undefined ? index : reqIds.length;
            reqIds = [...reqIds.slice(0, insertAt), id, ...reqIds.slice(insertAt)];
          }
          return { ...f, requestIds: reqIds };
        });
        set({ savedFolders: folders });
      },
      moveFolder: (id, targetFolderId, index) => {
        const folders = get().savedFolders;

        const isDescendant = (fid: string, targetId: string | null): boolean => {
          if (!targetId) return false;
          if (fid === targetId) return true;
          const target = folders.find((f) => f.id === targetId);
          if (!target) return false;
          return target.subFolderIds.some((cid) => isDescendant(fid, cid));
        };

        if (isDescendant(id, targetFolderId)) return;

        const updated = folders.map((f) => {
          let subIds = f.subFolderIds.filter((sid) => sid !== id);
          if (f.id === targetFolderId) {
            const insertAt = index !== undefined ? index : subIds.length;
            subIds = [...subIds.slice(0, insertAt), id, ...subIds.slice(insertAt)];
          }
          if (f.id === id) {
            return { ...f, parentFolderId: targetFolderId };
          }
          return { ...f, subFolderIds: subIds };
        });

        set({ savedFolders: updated });
      },
      setFolders: (folders) => set({ savedFolders: folders }),
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
