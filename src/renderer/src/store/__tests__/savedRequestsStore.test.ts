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
    expect(saved.bodyKeyValuePairs).toEqual(saved.body);
  });
});
