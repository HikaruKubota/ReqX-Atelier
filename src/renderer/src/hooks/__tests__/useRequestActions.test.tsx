import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRequestActions } from '../useRequestActions';

const getMockRefs = () => ({
  editorPanelRef: {
    current: {
      getRequestBodyAsJson: () => '{"foo":"bar"}',
      getRequestBodyKeyValuePairs: () => [
        { id: 'kv1', keyName: 'foo', value: 'bar', enabled: true },
      ],
    },
  },
  methodRef: { current: 'POST' },
  urlRef: { current: 'https://example.com' },
  headersRef: { current: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }] },
  requestNameForSaveRef: { current: 'テストリクエスト' },
  activeRequestIdRef: { current: null as string | null },
  setRequestNameForSave: vi.fn(),
});

describe('useRequestActions', () => {
  it('executeSendRequest calls executeRequest with correct arguments', async () => {
    const mockExecuteRequest = vi.fn();
    const refs = getMockRefs();

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setRequestNameForSave: refs.setRequestNameForSave,
        setActiveRequestId: vi.fn(),
        addRequest: vi.fn(),
        updateSavedRequest: vi.fn(),
        executeRequest: mockExecuteRequest,
      }),
    );

    await act(async () => {
      await result.current.executeSendRequest();
    });

    expect(mockExecuteRequest).toHaveBeenCalledWith(
      'POST',
      'https://example.com',
      '{"foo":"bar"}',
      { 'X-Test': '1' },
    );
  });

  it('executeSaveRequest adds new request if no activeRequestId', () => {
    const mockAddRequest = vi.fn().mockReturnValue('new-id');
    const mockSetActiveRequestId = vi.fn();
    const refs = getMockRefs();

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setRequestNameForSave: refs.setRequestNameForSave,
        setActiveRequestId: mockSetActiveRequestId,
        addRequest: mockAddRequest,
        updateSavedRequest: vi.fn(),
        executeRequest: vi.fn(),
      }),
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockAddRequest).toHaveBeenCalledWith({
      name: 'テストリクエスト',
      method: 'POST',
      url: 'https://example.com',
      headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
      bodyKeyValuePairs: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      body: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
    });
    expect(mockSetActiveRequestId).toHaveBeenCalledWith('new-id');
    expect(refs.setRequestNameForSave).toHaveBeenCalledWith('テストリクエスト');
  });

  it('executeSaveRequest updates request if activeRequestId exists', () => {
    const mockUpdateSavedRequest = vi.fn();
    const refs = getMockRefs();
    refs.activeRequestIdRef.current = 'existing-id';

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setRequestNameForSave: refs.setRequestNameForSave,
        setActiveRequestId: vi.fn(),
        addRequest: vi.fn(),
        updateSavedRequest: mockUpdateSavedRequest,
        executeRequest: vi.fn(),
      }),
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockUpdateSavedRequest).toHaveBeenCalledWith('existing-id', {
      name: 'テストリクエスト',
      method: 'POST',
      url: 'https://example.com',
      headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
      bodyKeyValuePairs: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      body: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
    });
    expect(refs.setRequestNameForSave).toHaveBeenCalledWith('テストリクエスト');
  });

  it('executeSaveRequest uses "Untitled Request" if name is empty', () => {
    const mockAddRequest = vi.fn().mockReturnValue('new-id');
    const mockSetActiveRequestId = vi.fn();
    const refs = getMockRefs();
    refs.requestNameForSaveRef.current = '   '; // 空白のみ

    const { result } = renderHook(() =>
      useRequestActions({
        ...refs,
        setRequestNameForSave: refs.setRequestNameForSave,
        setActiveRequestId: mockSetActiveRequestId,
        addRequest: mockAddRequest,
        updateSavedRequest: vi.fn(),
        executeRequest: vi.fn(),
      }),
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockAddRequest).toHaveBeenCalledWith({
      name: 'Untitled Request',
      method: 'POST',
      url: 'https://example.com',
      headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
      bodyKeyValuePairs: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      body: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
    });
    expect(mockSetActiveRequestId).toHaveBeenCalledWith('new-id');
    expect(refs.setRequestNameForSave).toHaveBeenCalledWith('Untitled Request');
  });
});
