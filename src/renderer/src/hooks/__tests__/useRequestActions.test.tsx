import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRequestActions } from '../useRequestActions';

const getMockRefs = () => ({
  editorPanelRef: {
    current: {
      getRequestBodyAsJson: () => '{"foo":"bar"}',
      getBody: () => [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      getParams: () => [{ id: 'p1', keyName: 'q', value: '1', enabled: true }],
    },
  },
  methodRef: { current: 'POST' },
  urlRef: { current: 'https://example.com?q=1' }, // URL already includes params due to sync
  headersRef: { current: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }] },
  paramsRef: { current: [{ id: 'p1', keyName: 'q', value: '1', enabled: true }] },
  variableExtractionRef: { current: undefined },
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
        paramsRef: refs.paramsRef,
        variableExtractionRef: refs.variableExtractionRef,
        executeRequest: mockExecuteRequest,
        resetDirtyState: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.executeSendRequest();
    });

    expect(mockExecuteRequest).toHaveBeenCalledWith(
      'POST',
      'https://example.com?q=1',
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
        paramsRef: refs.paramsRef,
        variableExtractionRef: refs.variableExtractionRef,
        executeRequest: vi.fn(),
        resetDirtyState: vi.fn(),
      }),
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockAddRequest).toHaveBeenCalledWith({
      name: 'テストリクエスト',
      method: 'POST',
      url: 'https://example.com?q=1',
      headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
      body: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      params: [{ id: 'p1', keyName: 'q', value: '1', enabled: true }],
      variableExtraction: undefined,
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
        paramsRef: refs.paramsRef,
        variableExtractionRef: refs.variableExtractionRef,
        executeRequest: vi.fn(),
        resetDirtyState: vi.fn(),
      }),
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockUpdateSavedRequest).toHaveBeenCalledWith('existing-id', {
      name: 'テストリクエスト',
      method: 'POST',
      url: 'https://example.com?q=1',
      headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
      body: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      params: [{ id: 'p1', keyName: 'q', value: '1', enabled: true }],
      variableExtraction: undefined,
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
        paramsRef: refs.paramsRef,
        variableExtractionRef: refs.variableExtractionRef,
        executeRequest: vi.fn(),
        resetDirtyState: vi.fn(),
      }),
    );

    act(() => {
      result.current.executeSaveRequest();
    });

    expect(mockAddRequest).toHaveBeenCalledWith({
      name: 'Untitled Request',
      method: 'POST',
      url: 'https://example.com?q=1',
      headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
      body: [{ id: 'kv1', keyName: 'foo', value: 'bar', enabled: true }],
      params: [{ id: 'p1', keyName: 'q', value: '1', enabled: true }],
      variableExtraction: undefined,
    });
    expect(mockSetActiveRequestId).toHaveBeenCalledWith('new-id');
    expect(refs.setRequestNameForSave).toHaveBeenCalledWith('Untitled Request');
  });
});
