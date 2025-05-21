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

  it('closes last active tab and activates previous', () => {
    const { result } = renderHook(() => useTabs());
    const ids: string[] = [];
    act(() => {
      ids.push(result.current.openTab().tabId);
    });
    act(() => {
      ids.push(result.current.openTab().tabId);
    });
    act(() => {
      ids.push(result.current.openTab().tabId);
    });
    act(() => {
      result.current.closeTab(ids[2]);
    });
    expect(result.current.tabs).toHaveLength(2);
    expect(result.current.activeTabId).toBe(ids[1]);
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

  it('prevTab and nextTab work with updated tabs after close', () => {
    const { result } = renderHook(() => useTabs());
    const ids: string[] = [];
    act(() => {
      ids.push(result.current.openTab().tabId);
    });
    act(() => {
      ids.push(result.current.openTab().tabId);
    });
    act(() => {
      ids.push(result.current.openTab().tabId);
    });
    act(() => {
      result.current.closeTab(ids[1]);
    });
    act(() => {
      result.current.prevTab();
    });
    expect(result.current.activeTabId).toBe(ids[0]);
    act(() => {
      result.current.nextTab();
    });
    expect(result.current.activeTabId).toBe(ids[2]);
  });

  it('moves active tab left and right', () => {
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab();
      result.current.openTab();
      result.current.openTab();
    });
    const [first, second, third] = result.current.tabs;
    act(() => {
      result.current.switchTab(second.tabId);
    });
    act(() => {
      result.current.moveActiveTabRight();
    });
    expect(result.current.tabs[2].tabId).toBe(second.tabId);
    act(() => {
      result.current.moveActiveTabLeft();
    });
    expect(result.current.tabs[1].tabId).toBe(second.tabId);
    expect(result.current.tabs[0].tabId).toBe(first.tabId);
    expect(result.current.tabs[2].tabId).toBe(third.tabId);
  });

  it('reorders tabs by id', () => {
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab();
      result.current.openTab();
      result.current.openTab();
    });
    const [first, second, third] = result.current.tabs;
    act(() => {
      result.current.reorderTabs(second.tabId, first.tabId);
    });
    expect(result.current.tabs[0].tabId).toBe(second.tabId);
    expect(result.current.tabs[1].tabId).toBe(first.tabId);
    expect(result.current.tabs[2].tabId).toBe(third.tabId);
  });
});
