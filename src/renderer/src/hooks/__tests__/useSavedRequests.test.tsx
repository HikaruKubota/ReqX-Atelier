import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSavedRequests } from '../useSavedRequests';

beforeEach(() => {
  localStorage.clear();
});

describe('useSavedRequests', () => {
  it('can add folder and request with folderId', () => {
    const { result } = renderHook(() => useSavedRequests());

    let folderId: string = '';
    act(() => {
      folderId = result.current.addFolder('Folder1');
    });
    expect(result.current.folders).toHaveLength(1);

    let reqId: string = '';
    act(() => {
      reqId = result.current.addRequest({
        name: 'req',
        method: 'GET',
        url: 'https://example.com',
        folderId,
      });
    });

    expect(result.current.savedRequests[0].folderId).toBe(folderId);

    act(() => {
      result.current.moveRequest(reqId, undefined);
    });
    expect(result.current.savedRequests[0].folderId).toBeUndefined();
  });
});
