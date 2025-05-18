import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRequestActions } from '../useRequestActions';

const getMockRefs = () => ({
  editorPanelRef: {
    current: {
      getRequestBodyAsJson: () => '{"foo":"bar"}',
      getRequestBodyKeyValuePairs: () => [{ key: 'foo', value: 'bar' }],
    },
  },
  methodRef: { current: 'POST' },
  urlRef: { current: 'https://example.com' },
  headersRef: { current: [{ key: 'X-Test', value: '1', enabled: true }] },
  requestNameForSaveRef: { current: 'テストリクエスト' },
  activeRequestIdRef: { current: null as string | null },
});

describe('useRequestActions', () => {
  it('executeSendRequest calls executeRequest with correct arguments', async () => {
    const mockExecuteRequest = vi.fn();
    const refs = getMockRefs();

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setActiveRequestId: vi.fn(),
        addRequest: vi.fn(),
        updateSavedRequest: vi.fn(),
        executeRequest: mockExecuteRequest,
      })
    );

    await act(async () => {
      await result.current.executeSendRequest();
    });

    expect(mockExecuteRequest).toHaveBeenCalledWith(
      'POST',
      'https://example.com',
      '{"foo":"bar"}',
      { 'X-Test': '1' }
    );
  });

  it('executeSaveRequest adds new request if no activeRequestId', () => {
    const mockAddRequest = vi.fn().mockReturnValue('new-id');
    const mockSetActiveRequestId = vi.fn();
    const refs = getMockRefs();

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setActiveRequestId: mockSetActiveRequestId,
        addRequest: mockAddRequest,
        updateSavedRequest: vi.fn(),
        executeRequest: vi.fn(),
      })
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockAddRequest).toHaveBeenCalledWith({
      name: 'テストリクエスト',
      method: 'POST',
      url: 'https://example.com',
      headers: [{ key: 'X-Test', value: '1', enabled: true }],
      bodyKeyValuePairs: [{ key: 'foo', value: 'bar' }],
    });
    expect(mockSetActiveRequestId).toHaveBeenCalledWith('new-id');
  });

  it('executeSaveRequest updates request if activeRequestId exists', () => {
    const mockUpdateSavedRequest = vi.fn();
    const refs = getMockRefs();
    refs.activeRequestIdRef.current = 'existing-id';

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setActiveRequestId: vi.fn(),
        addRequest: vi.fn(),
        updateSavedRequest: mockUpdateSavedRequest,
        executeRequest: vi.fn(),
      })
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockUpdateSavedRequest).toHaveBeenCalledWith('existing-id', {
      name: 'テストリクエスト',
      method: 'POST',
      url: 'https://example.com',
      headers: [{ key: 'X-Test', value: '1', enabled: true }],
      bodyKeyValuePairs: [{ key: 'foo', value: 'bar' }],
    });
  });

  it('executeSaveRequest uses "Untitled Request" if name is empty', () => {
    const mockAddRequest = vi.fn().mockReturnValue('new-id');
    const mockSetActiveRequestId = vi.fn();
    const refs = getMockRefs();
    refs.requestNameForSaveRef.current = '   '; // 空白のみ

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setActiveRequestId: mockSetActiveRequestId,
        addRequest: mockAddRequest,
        updateSavedRequest: vi.fn(),
        executeRequest: vi.fn(),
      })
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockAddRequest).toHaveBeenCalledWith({
      name: 'Untitled Request',
      method: 'POST',
      url: 'https://example.com',
      headers: [{ key: 'X-Test', value: '1', enabled: true }],
      bodyKeyValuePairs: [{ key: 'foo', value: 'bar' }],
    });
    expect(mockSetActiveRequestId).toHaveBeenCalledWith('new-id');
  });
});
