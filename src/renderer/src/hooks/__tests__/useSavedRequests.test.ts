import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSavedRequests } from '../useSavedRequests';

describe('useSavedRequests', () => {
  it('adds folder and request', () => {
    const { result } = renderHook(() => useSavedRequests());
    act(() => {
      const folderId = result.current.addFolder('My Folder');
      result.current.addRequest({
        name: 'req',
        method: 'GET',
        url: 'http://example.com',
        folderId,
      });
    });
    expect(result.current.folders.length).toBe(2); // default + added
    expect(result.current.savedRequests[0].folderId).toBe(result.current.folders[1].id);
  });
});
