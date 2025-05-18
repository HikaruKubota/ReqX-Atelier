import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTabs } from '../useTabs';

describe('useTabs', () => {
  it('opens a tab and sets it active', () => {
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab();
    });
    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeTabId).toBe(result.current.tabs[0].tabId);
  });

  it('closes active tab and activates next', () => {
    const { result } = renderHook(() => useTabs());
    let firstId!: string;
    let secondId!: string;
    act(() => {
      firstId = result.current.openTab().tabId;
    });
    act(() => {
      secondId = result.current.openTab().tabId;
    });
    act(() => {
      result.current.closeTab(firstId);
    });
    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeTabId).toBe(secondId);
  });

  it('switches to next and previous tabs', () => {
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab();
    });
    act(() => {
      result.current.openTab();
    });
    const [first, second] = result.current.tabs;
    act(() => {
      result.current.switchTab(first.tabId);
    });
    act(() => {
      result.current.nextTab();
    });
    expect(result.current.activeTabId).toBe(second.tabId);
    act(() => {
      result.current.prevTab();
    });
    expect(result.current.activeTabId).toBe(first.tabId);
  });
});
