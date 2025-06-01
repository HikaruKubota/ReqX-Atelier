import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUrlParamsSync } from '../useUrlParamsSync';
import type { KeyValuePair } from '../../types';

describe('useUrlParamsSync', () => {
  it('extracts params from URL when URL changes', () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com?foo=bar&baz=qux';
    const initialParams: KeyValuePair[] = [];

    renderHook(() =>
      useUrlParamsSync({
        url: initialUrl,
        params: initialParams,
        onUrlChange,
        onParamsChange,
      }),
    );

    // Check that params were extracted
    expect(onParamsChange).toHaveBeenCalledWith([
      expect.objectContaining({ keyName: 'foo', value: 'bar', enabled: true }),
      expect.objectContaining({ keyName: 'baz', value: 'qux', enabled: true }),
    ]);
  });

  it('updates URL when params change', () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com';
    const initialParams: KeyValuePair[] = [];

    const { rerender } = renderHook(
      ({ url, params }) =>
        useUrlParamsSync({
          url,
          params,
          onUrlChange,
          onParamsChange,
        }),
      {
        initialProps: { url: initialUrl, params: initialParams },
      },
    );

    // Update params
    const newParams: KeyValuePair[] = [
      { id: '1', keyName: 'foo', value: 'bar', enabled: true },
      { id: '2', keyName: 'baz', value: 'qux', enabled: true },
    ];

    rerender({ url: initialUrl, params: newParams });

    // Check that URL was updated
    expect(onUrlChange).toHaveBeenCalledWith('https://api.example.com?foo=bar&baz=qux');
  });

  it('handles disabled params correctly', () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com';
    const initialParams: KeyValuePair[] = [];

    const { rerender } = renderHook(
      ({ url, params }) =>
        useUrlParamsSync({
          url,
          params,
          onUrlChange,
          onParamsChange,
        }),
      {
        initialProps: { url: initialUrl, params: initialParams },
      },
    );

    // Update params with one disabled
    const newParams: KeyValuePair[] = [
      { id: '1', keyName: 'foo', value: 'bar', enabled: true },
      { id: '2', keyName: 'baz', value: 'qux', enabled: false },
    ];

    rerender({ url: initialUrl, params: newParams });

    // Check that only enabled param is in URL
    expect(onUrlChange).toHaveBeenCalledWith('https://api.example.com?foo=bar');
  });

  it('handles invalid URLs gracefully', async () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const invalidUrl = 'not-a-valid-url';
    const params: KeyValuePair[] = [{ id: '1', keyName: 'foo', value: 'bar', enabled: true }];

    const { rerender } = renderHook(
      ({ url, params }: { url: string; params: KeyValuePair[] }) =>
        useUrlParamsSync({
          url,
          params,
          onUrlChange,
          onParamsChange,
        }),
      {
        initialProps: { url: invalidUrl, params },
      },
    );

    // Wait for the URL changed flag to be reset
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Trigger a params change
    rerender({ url: invalidUrl, params: [...params] });

    // Should append params as query string
    expect(onUrlChange).toHaveBeenCalledWith('not-a-valid-url?foo=bar');
  });

  it('prevents infinite loops when syncing', () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com?foo=bar';
    const initialParams: KeyValuePair[] = [
      { id: '1', keyName: 'foo', value: 'bar', enabled: true },
    ];

    const { rerender } = renderHook(
      ({ url, params }) =>
        useUrlParamsSync({
          url,
          params,
          onUrlChange,
          onParamsChange,
        }),
      {
        initialProps: { url: initialUrl, params: initialParams },
      },
    );

    // Clear mocks after initial render
    onUrlChange.mockClear();
    onParamsChange.mockClear();

    // Rerender with same values
    rerender({ url: initialUrl, params: initialParams });

    // Should not trigger any updates
    expect(onUrlChange).not.toHaveBeenCalled();
    expect(onParamsChange).not.toHaveBeenCalled();
  });

  it('handles empty values correctly', async () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com';
    const params: KeyValuePair[] = [
      { id: '1', keyName: 'foo', value: '', enabled: true },
      { id: '2', keyName: 'bar', value: 'baz', enabled: true },
    ];

    const { rerender } = renderHook(
      ({ url, params }: { url: string; params: KeyValuePair[] }) =>
        useUrlParamsSync({
          url,
          params,
          onUrlChange,
          onParamsChange,
        }),
      {
        initialProps: { url: initialUrl, params: [] as KeyValuePair[] },
      },
    );

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update params
    rerender({ url: initialUrl, params });

    // Should include empty value params
    expect(onUrlChange).toHaveBeenCalledWith('https://api.example.com?foo=&bar=baz');
  });

  it('preserves existing URL path and hash', async () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com/path/to/resource#section';
    const params: KeyValuePair[] = [{ id: '1', keyName: 'foo', value: 'bar', enabled: true }];

    const { rerender } = renderHook(
      ({ url, params }: { url: string; params: KeyValuePair[] }) =>
        useUrlParamsSync({
          url,
          params,
          onUrlChange,
          onParamsChange,
        }),
      {
        initialProps: { url: initialUrl, params: [] as KeyValuePair[] },
      },
    );

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update params
    rerender({ url: initialUrl, params });

    // Should preserve path and hash
    expect(onUrlChange).toHaveBeenCalledWith(
      'https://api.example.com/path/to/resource?foo=bar#section',
    );
  });

  it('handles URL-encoded values correctly', () => {
    const onUrlChange = vi.fn();
    const onParamsChange = vi.fn();

    const initialUrl = 'https://api.example.com?name=John%20Doe&email=test%40example.com';
    const initialParams: KeyValuePair[] = [];

    renderHook(() =>
      useUrlParamsSync({
        url: initialUrl,
        params: initialParams,
        onUrlChange,
        onParamsChange,
      }),
    );

    // Check that params were decoded properly
    expect(onParamsChange).toHaveBeenCalledWith([
      expect.objectContaining({ keyName: 'name', value: 'John Doe', enabled: true }),
      expect.objectContaining({ keyName: 'email', value: 'test@example.com', enabled: true }),
    ]);
  });
});
