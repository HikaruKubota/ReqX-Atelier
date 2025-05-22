import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('savedRequestsStore migration', () => {
  it('migrates string body to key-value pairs', async () => {
    const oldData = [
      {
        id: 'req1',
        name: 'old',
        method: 'POST',
        url: 'https://example.com',
        body: '{"foo":"bar"}',
      },
    ];
    localStorage.setItem(
      'reqx_saved_requests',
      JSON.stringify({ state: { savedRequests: oldData }, version: 0 }),
    );

    const { useSavedRequestsStore } = await import('../savedRequestsStore');

    const saved = useSavedRequestsStore.getState().savedRequests[0];
    expect(saved.body).toEqual([
      {
        id: expect.any(String),
        keyName: 'foo',
        value: 'bar',
        enabled: true,
      },
    ]);
    expect(Array.isArray(saved.body)).toBe(true);
  });

  it('migrates saved folders from storage', async () => {
    const oldFolders = [
      {
        id: 'folder1',
        name: 'Old Folder',
        requestIds: ['req1'],
        subFolderIds: ['folder2'],
        parentFolderId: null,
      },
    ];
    localStorage.setItem(
      'reqx_saved_requests',
      JSON.stringify({ state: { savedFolders: oldFolders }, version: 0 }),
    );

    const { useSavedRequestsStore } = await import('../savedRequestsStore');

    const folder = useSavedRequestsStore.getState().savedFolders[0];
    expect(folder).toEqual({
      id: 'folder1',
      name: 'Old Folder',
      parentFolderId: null,
      requestIds: ['req1'],
      subFolderIds: ['folder2'],
    });
  });
});

describe('savedFolders CRUD', () => {
  it('adds and deletes folders correctly', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');

    const id = useSavedRequestsStore.getState().addFolder({
      name: 'Test',
      parentFolderId: null,
      requestIds: [],
      subFolderIds: [],
    });
    expect(useSavedRequestsStore.getState().savedFolders).toHaveLength(1);

    useSavedRequestsStore.getState().deleteFolder(id);
    expect(useSavedRequestsStore.getState().savedFolders).toHaveLength(0);
  });

  it('updates folders correctly', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');

    const id = useSavedRequestsStore.getState().addFolder({
      name: 'Folder',
      parentFolderId: null,
      requestIds: [],
      subFolderIds: [],
    });
    useSavedRequestsStore.getState().updateFolder(id, { name: 'Updated', subFolderIds: ['child'] });

    const folder = useSavedRequestsStore.getState().savedFolders.find((f) => f.id === id);
    expect(folder).toEqual({
      id,
      name: 'Updated',
      parentFolderId: null,
      requestIds: [],
      subFolderIds: ['child'],
    });
  });
});

describe('copyRequest', () => {
  it('duplicates a request with copy suffix', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');
    const id = useSavedRequestsStore.getState().addRequest({
      name: 'Original',
      method: 'GET',
      url: 'https://example.com',
      headers: [],
      body: [],
    });
    const newId = useSavedRequestsStore.getState().copyRequest(id);
    const list = useSavedRequestsStore.getState().savedRequests;
    const copied = list.find((r) => r.id === newId);
    expect(copied?.name).toBe('Original copy');
    expect(list).toHaveLength(2);
  });
});

describe('move helpers', () => {
  it('moves request between folders', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');
    const reqId = useSavedRequestsStore.getState().addRequest({
      name: 'R',
      method: 'GET',
      url: '',
      headers: [],
      body: [],
    });
    const folderA = useSavedRequestsStore.getState().addFolder({
      name: 'A',
      parentFolderId: null,
      requestIds: [reqId],
      subFolderIds: [],
    });
    const folderB = useSavedRequestsStore.getState().addFolder({
      name: 'B',
      parentFolderId: null,
      requestIds: [],
      subFolderIds: [],
    });
    useSavedRequestsStore.getState().moveRequestToFolder(reqId, folderB);
    const a = useSavedRequestsStore.getState().savedFolders.find((f) => f.id === folderA);
    const b = useSavedRequestsStore.getState().savedFolders.find((f) => f.id === folderB);
    expect(a?.requestIds).not.toContain(reqId);
    expect(b?.requestIds).toContain(reqId);
  });

  it('moves folder under another folder', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');
    const folderA = useSavedRequestsStore.getState().addFolder({
      name: 'A',
      parentFolderId: null,
      requestIds: [],
      subFolderIds: [],
    });
    const folderB = useSavedRequestsStore.getState().addFolder({
      name: 'B',
      parentFolderId: null,
      requestIds: [],
      subFolderIds: [],
    });
    useSavedRequestsStore.getState().moveFolder(folderA, folderB);
    const b = useSavedRequestsStore.getState().savedFolders.find((f) => f.id === folderB);
    const a = useSavedRequestsStore.getState().savedFolders.find((f) => f.id === folderA);
    expect(b?.subFolderIds).toContain(folderA);
    expect(a?.parentFolderId).toBe(folderB);
  });
});
