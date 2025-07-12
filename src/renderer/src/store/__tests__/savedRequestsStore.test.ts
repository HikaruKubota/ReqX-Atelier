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
    });
    useSavedRequestsStore.getState().updateFolder(id, { name: 'Updated' });

    const folder = useSavedRequestsStore.getState().savedFolders.find((f) => f.id === id);
    expect(folder).toEqual({
      id,
      name: 'Updated',
      parentFolderId: null,
      requestIds: [],
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

describe('copyFolder', () => {
  it('duplicates a folder and its contents recursively', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');
    const reqId = useSavedRequestsStore.getState().addRequest({
      name: 'Req',
      method: 'GET',
      url: 'https://example.com',
      headers: [],
      body: [],
    });
    const rootFolderId = useSavedRequestsStore.getState().addFolder({
      name: 'Root',
      parentFolderId: null,
      requestIds: [],
    });
    useSavedRequestsStore.getState().addFolder({
      name: 'Child',
      parentFolderId: rootFolderId,
      requestIds: [reqId],
    });

    const newId = useSavedRequestsStore.getState().copyFolder(rootFolderId);
    const folders = useSavedRequestsStore.getState().savedFolders;
    const requests = useSavedRequestsStore.getState().savedRequests;
    expect(folders).toHaveLength(4); // original two + copy and child copy
    expect(requests).toHaveLength(2); // original + copy
    const copied = folders.find((f) => f.id === newId)!;
    expect(copied.name).toBe('Root copy');
    // Find child by checking parentFolderId
    const copiedChildren = folders.filter((f) => f.parentFolderId === newId);
    expect(copiedChildren).toHaveLength(1);
    const copiedChild = copiedChildren[0];
    expect(copiedChild.name).toBe('Child');
    expect(copiedChild.requestIds).toHaveLength(1);
    const copiedReq = requests.find((r) => r.id === copiedChild.requestIds[0])!;
    expect(copiedReq.name).toBe('Req');
  });
});

describe('moveFolder', () => {
  it('moves a folder to its grandparent correctly', async () => {
    const { useSavedRequestsStore } = await import('../savedRequestsStore');

    const grandId = useSavedRequestsStore.getState().addFolder({
      name: 'Grand',
      parentFolderId: null,
      requestIds: [],
    });

    const parentId = useSavedRequestsStore.getState().addFolder({
      name: 'Parent',
      parentFolderId: grandId,
      requestIds: [],
    });

    const childId = useSavedRequestsStore.getState().addFolder({
      name: 'Child',
      parentFolderId: parentId,
      requestIds: [],
    });

    useSavedRequestsStore.getState().moveFolder(childId, grandId);

    const folders = useSavedRequestsStore.getState().savedFolders;
    const child = folders.find((f) => f.id === childId)!;

    expect(child.parentFolderId).toBe(grandId);
    // Verify parent-child relationships through parentFolderId
    const grandChildren = folders.filter((f) => f.parentFolderId === grandId);
    expect(grandChildren.map((f) => f.id).sort()).toEqual([parentId, childId].sort());
    const parentChildren = folders.filter((f) => f.parentFolderId === parentId);
    expect(parentChildren).toHaveLength(0);
  });
});
