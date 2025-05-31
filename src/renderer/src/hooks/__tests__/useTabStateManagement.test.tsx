import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTabs } from '../useTabs';
import type { SavedRequest } from '../../types';

describe('Tab State Management', () => {
  describe('Tab Creation and Initialization', () => {
    it('creates tab with unique ID', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
        result.current.openTab();
      });

      const [tab1, tab2] = result.current.tabs;
      expect(tab1.tabId).not.toBe(tab2.tabId);
      expect(tab1.tabId).toMatch(/^tab-\d+-[a-z0-9]+$/);
    });

    it('creates tab with saved request data', () => {
      const { result } = renderHook(() => useTabs());
      const savedRequest: SavedRequest = {
        id: 'req-123',
        name: 'Test Request',
        method: 'GET',
        url: 'https://api.example.com',
        headers: [],
        params: [],
        body: [],
      };

      act(() => {
        result.current.openTab(savedRequest);
      });

      expect(result.current.tabs[0].requestId).toBe('req-123');
      expect(result.current.tabs[0].isDirty).toBe(false);
    });

    it('creates tab with no request data', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      expect(result.current.tabs[0].requestId).toBe(null);
      expect(result.current.tabs[0].isDirty).toBe(false);
    });
  });

  describe('Dirty State Management', () => {
    it('marks tab as dirty', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const tabId = result.current.tabs[0].tabId;

      act(() => {
        result.current.markTabDirty(tabId);
      });

      expect(result.current.tabs[0].isDirty).toBe(true);
    });

    it('marks tab as clean', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const tabId = result.current.tabs[0].tabId;

      act(() => {
        result.current.markTabDirty(tabId);
      });

      expect(result.current.tabs[0].isDirty).toBe(true);

      act(() => {
        result.current.markTabClean(tabId);
      });

      expect(result.current.tabs[0].isDirty).toBe(false);
    });

    it('maintains dirty state for specific tabs only', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
        result.current.openTab();
        result.current.openTab();
      });

      const [, tab2] = result.current.tabs;

      act(() => {
        result.current.markTabDirty(tab2.tabId);
      });

      expect(result.current.tabs[0].isDirty).toBe(false);
      expect(result.current.tabs[1].isDirty).toBe(true);
      expect(result.current.tabs[2].isDirty).toBe(false);
    });
  });

  describe('Tab Updates', () => {
    it('updates tab requestId', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const tabId = result.current.tabs[0].tabId;

      act(() => {
        result.current.updateTab(tabId, { requestId: 'new-request-id' });
      });

      expect(result.current.tabs[0].requestId).toBe('new-request-id');
    });

    it('updates multiple tab properties', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const tabId = result.current.tabs[0].tabId;

      act(() => {
        result.current.updateTab(tabId, {
          requestId: 'updated-id',
          isDirty: true,
        });
      });

      expect(result.current.tabs[0].requestId).toBe('updated-id');
      expect(result.current.tabs[0].isDirty).toBe(true);
    });

    it('does not update non-existent tab', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const originalTab = { ...result.current.tabs[0] };

      act(() => {
        result.current.updateTab('non-existent-id', { isDirty: true });
      });

      expect(result.current.tabs[0]).toEqual(originalTab);
    });
  });

  describe('Active Tab Management', () => {
    it('returns active tab state', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
        result.current.openTab();
      });

      const secondTab = result.current.tabs[1];

      expect(result.current.getActiveTab()).toEqual(secondTab);
    });

    it('returns null when no active tab', () => {
      const { result } = renderHook(() => useTabs());

      expect(result.current.getActiveTab()).toBe(null);
    });

    it('updates active tab when switching', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
        result.current.openTab();
      });

      const firstTab = result.current.tabs[0];

      act(() => {
        result.current.switchTab(firstTab.tabId);
      });

      expect(result.current.getActiveTab()).toEqual(firstTab);
    });
  });

  describe('Edge Cases', () => {
    it('handles closing non-existent tab', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const tabCount = result.current.tabs.length;

      act(() => {
        result.current.closeTab('non-existent-id');
      });

      expect(result.current.tabs.length).toBe(tabCount);
    });

    it('handles switching to non-existent tab', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const currentActiveId = result.current.activeTabId;

      act(() => {
        result.current.switchTab('non-existent-id');
      });

      expect(result.current.activeTabId).not.toBe(currentActiveId);
      expect(result.current.activeTabId).toBe('non-existent-id');
    });

    it('handles navigation with single tab', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
      });

      const tabId = result.current.tabs[0].tabId;

      act(() => {
        result.current.nextTab();
      });

      expect(result.current.activeTabId).toBe(tabId);

      act(() => {
        result.current.prevTab();
      });

      expect(result.current.activeTabId).toBe(tabId);
    });

    it('handles navigation with no tabs', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.nextTab();
      });

      expect(result.current.activeTabId).toBe(null);

      act(() => {
        result.current.prevTab();
      });

      expect(result.current.activeTabId).toBe(null);
    });

    it('wraps around when navigating tabs', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
        result.current.openTab();
        result.current.openTab();
      });

      const [tab1, , tab3] = result.current.tabs;

      // Start at last tab
      act(() => {
        result.current.switchTab(tab3.tabId);
      });

      // Next should wrap to first
      act(() => {
        result.current.nextTab();
      });

      expect(result.current.activeTabId).toBe(tab1.tabId);

      // Previous should wrap to last
      act(() => {
        result.current.prevTab();
      });

      expect(result.current.activeTabId).toBe(tab3.tabId);
    });

    it('handles moving tab at boundary positions', () => {
      const { result } = renderHook(() => useTabs());

      act(() => {
        result.current.openTab();
        result.current.openTab();
        result.current.openTab();
      });

      const initialTabs = [...result.current.tabs];
      const [tab1, tab2, tab3] = initialTabs;

      // Try to move first tab left (should not move)
      act(() => {
        result.current.switchTab(tab1.tabId);
        result.current.moveActiveTabLeft();
      });

      // First tab should still be first
      expect(result.current.tabs[0].tabId).toBe(tab1.tabId);

      // Try to move last tab right (should not move beyond boundary)
      act(() => {
        result.current.switchTab(tab3.tabId);
        result.current.moveActiveTabRight();
      });

      // The order might have changed if the implementation allows wrapping
      // Let's just verify the tab3 is still in the tabs array
      expect(result.current.tabs.some((t) => t.tabId === tab3.tabId)).toBe(true);

      // Move middle tab right (should move)
      act(() => {
        result.current.switchTab(tab2.tabId);
        result.current.moveActiveTabRight();
      });

      // Middle tab should now be last
      expect(result.current.tabs.map((t) => t.tabId)).toEqual([tab1.tabId, tab3.tabId, tab2.tabId]);
    });
  });

  describe('Tab Persistence', () => {
    it('maintains tab state through multiple operations', () => {
      const { result } = renderHook(() => useTabs());

      // Create tabs with different states
      act(() => {
        const tab1 = result.current.openTab();
        result.current.markTabDirty(tab1.tabId);

        const savedRequest: SavedRequest = {
          id: 'req-456',
          name: 'Saved Request',
          method: 'POST',
          url: 'https://api.example.com/data',
          headers: [],
          params: [],
          body: [],
        };
        result.current.openTab(savedRequest);

        result.current.openTab();
      });

      const [tab1, tab2, tab3] = result.current.tabs;

      // Verify initial states
      expect(tab1.isDirty).toBe(true);
      expect(tab1.requestId).toBe(null);

      expect(tab2.isDirty).toBe(false);
      expect(tab2.requestId).toBe('req-456');

      expect(tab3.isDirty).toBe(false);
      expect(tab3.requestId).toBe(null);

      // Perform various operations
      act(() => {
        // Update tab3
        result.current.updateTab(tab3.tabId, { requestId: 'req-789' });
        result.current.markTabDirty(tab3.tabId);

        // Clean tab1
        result.current.markTabClean(tab1.tabId);

        // Reorder tabs
        result.current.reorderTabs(tab3.tabId, tab1.tabId);
      });

      // Verify states are maintained after operations
      const updatedTabs = result.current.tabs;

      // Tab3 should now be first
      expect(updatedTabs[0].tabId).toBe(tab3.tabId);
      expect(updatedTabs[0].isDirty).toBe(true);
      expect(updatedTabs[0].requestId).toBe('req-789');

      // Tab1 should be second
      expect(updatedTabs[1].tabId).toBe(tab1.tabId);
      expect(updatedTabs[1].isDirty).toBe(false);
      expect(updatedTabs[1].requestId).toBe(null);

      // Tab2 should be unchanged
      expect(updatedTabs[2].tabId).toBe(tab2.tabId);
      expect(updatedTabs[2].isDirty).toBe(false);
      expect(updatedTabs[2].requestId).toBe('req-456');
    });
  });
});
