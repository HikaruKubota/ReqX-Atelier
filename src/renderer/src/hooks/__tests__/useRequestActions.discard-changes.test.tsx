import { describe, it, expect, vi } from 'vitest';

describe('useRequestActions - Discard Changes Dialog', () => {
  it('shows confirmation dialog when loading request with unsaved changes', () => {
    // Mock window.confirm
    const mockConfirm = vi.fn();
    window.confirm = mockConfirm;
    mockConfirm.mockReturnValue(true);

    // Mock tabs with a dirty tab
    const mockTabs = {
      tabs: [{ tabId: 'tab1', requestId: null, isDirty: true }],
      activeTabId: 'tab1',
      getActiveTab: vi.fn(() => ({ tabId: 'tab1', requestId: null, isDirty: true })),
      openTab: vi.fn(() => ({ tabId: 'tab2', requestId: 'req1', isDirty: false })),
      switchTab: vi.fn(),
    };

    // Mock handleLoadRequest
    const mockHandleLoadRequest = vi.fn((req, tabs, t) => {
      const existing = tabs.tabs.find(
        (tab: { tabId: string; requestId: string | null; isDirty: boolean }) =>
          tab.requestId === req.id,
      );

      if (existing) {
        tabs.switchTab(existing.tabId);
        return;
      }

      // Check if current tab has unsaved changes
      const currentTab = tabs.getActiveTab();
      if (currentTab && currentTab.isDirty) {
        const confirmMessage = t('discard_changes_confirm', {
          defaultValue:
            'You have unsaved changes. Do you want to discard them and open the new request?',
        });

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      // Open new tab with the request
      tabs.openTab(req);
    });

    // Mock translation
    const mockT = vi.fn((key: string, options?: { defaultValue?: string }) => {
      if (key === 'discard_changes_confirm') {
        return (
          options?.defaultValue ||
          'You have unsaved changes. Do you want to discard them and open the new request?'
        );
      }
      return key;
    });

    // Test loading a new request
    const testRequest = { id: 'req1', name: 'Test Request' };
    mockHandleLoadRequest(testRequest, mockTabs, mockT);

    // Verify confirm was called with the correct message
    expect(mockConfirm).toHaveBeenCalledWith(
      'You have unsaved changes. Do you want to discard them and open the new request?',
    );

    // Verify new tab was opened
    expect(mockTabs.openTab).toHaveBeenCalledWith(testRequest);
  });

  it('does not show confirmation when loading request without unsaved changes', () => {
    const mockConfirm = vi.fn();
    window.confirm = mockConfirm;

    // Mock tabs with a clean tab
    const mockTabs = {
      tabs: [{ tabId: 'tab1', requestId: null, isDirty: false }],
      activeTabId: 'tab1',
      getActiveTab: vi.fn(() => ({ tabId: 'tab1', requestId: null, isDirty: false })),
      openTab: vi.fn(() => ({ tabId: 'tab2', requestId: 'req1', isDirty: false })),
      switchTab: vi.fn(),
    };

    // Mock handleLoadRequest
    const mockHandleLoadRequest = vi.fn((req, tabs, t) => {
      const existing = tabs.tabs.find(
        (tab: { tabId: string; requestId: string | null; isDirty: boolean }) =>
          tab.requestId === req.id,
      );

      if (existing) {
        tabs.switchTab(existing.tabId);
        return;
      }

      // Check if current tab has unsaved changes
      const currentTab = tabs.getActiveTab();
      if (currentTab && currentTab.isDirty) {
        const confirmMessage = t('discard_changes_confirm', {
          defaultValue:
            'You have unsaved changes. Do you want to discard them and open the new request?',
        });

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      // Open new tab with the request
      tabs.openTab(req);
    });

    // Mock translation
    const mockT = vi.fn(() => 'dummy');

    // Test loading a new request
    const testRequest = { id: 'req1', name: 'Test Request' };
    mockHandleLoadRequest(testRequest, mockTabs, mockT);

    // Verify confirm was NOT called
    expect(mockConfirm).not.toHaveBeenCalled();

    // Verify new tab was opened
    expect(mockTabs.openTab).toHaveBeenCalledWith(testRequest);
  });

  it('cancels loading when user declines confirmation', () => {
    const mockConfirm = vi.fn();
    window.confirm = mockConfirm;
    mockConfirm.mockReturnValue(false); // User cancels

    // Mock tabs with a dirty tab
    const mockTabs = {
      tabs: [{ tabId: 'tab1', requestId: null, isDirty: true }],
      activeTabId: 'tab1',
      getActiveTab: vi.fn(() => ({ tabId: 'tab1', requestId: null, isDirty: true })),
      openTab: vi.fn(),
      switchTab: vi.fn(),
    };

    // Mock handleLoadRequest
    const mockHandleLoadRequest = vi.fn((req, tabs, t) => {
      const existing = tabs.tabs.find(
        (tab: { tabId: string; requestId: string | null; isDirty: boolean }) =>
          tab.requestId === req.id,
      );

      if (existing) {
        tabs.switchTab(existing.tabId);
        return;
      }

      // Check if current tab has unsaved changes
      const currentTab = tabs.getActiveTab();
      if (currentTab && currentTab.isDirty) {
        const confirmMessage = t('discard_changes_confirm', {
          defaultValue:
            'You have unsaved changes. Do you want to discard them and open the new request?',
        });

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      // Open new tab with the request
      tabs.openTab(req);
    });

    // Mock translation
    const mockT = vi.fn((key: string, options?: { defaultValue?: string }) => {
      if (key === 'discard_changes_confirm') {
        return (
          options?.defaultValue ||
          'You have unsaved changes. Do you want to discard them and open the new request?'
        );
      }
      return key;
    });

    // Test loading a new request
    const testRequest = { id: 'req1', name: 'Test Request' };
    mockHandleLoadRequest(testRequest, mockTabs, mockT);

    // Verify confirm was called
    expect(mockConfirm).toHaveBeenCalled();

    // Verify new tab was NOT opened
    expect(mockTabs.openTab).not.toHaveBeenCalled();
  });

  it('switches to existing tab without confirmation', () => {
    const mockConfirm = vi.fn();
    window.confirm = mockConfirm;

    // Mock tabs with existing request tab and a dirty tab
    const mockTabs = {
      tabs: [
        { tabId: 'tab1', requestId: 'req1', isDirty: false },
        { tabId: 'tab2', requestId: null, isDirty: true },
      ],
      activeTabId: 'tab2',
      getActiveTab: vi.fn(() => ({ tabId: 'tab2', requestId: null, isDirty: true })),
      openTab: vi.fn(),
      switchTab: vi.fn(),
    };

    // Mock handleLoadRequest
    const mockHandleLoadRequest = vi.fn((req, tabs, t) => {
      const existing = tabs.tabs.find(
        (tab: { tabId: string; requestId: string | null; isDirty: boolean }) =>
          tab.requestId === req.id,
      );

      if (existing) {
        tabs.switchTab(existing.tabId);
        return;
      }

      // Check if current tab has unsaved changes
      const currentTab = tabs.getActiveTab();
      if (currentTab && currentTab.isDirty) {
        const confirmMessage = t('discard_changes_confirm', {
          defaultValue:
            'You have unsaved changes. Do you want to discard them and open the new request?',
        });

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      // Open new tab with the request
      tabs.openTab(req);
    });

    // Mock translation
    const mockT = vi.fn(() => 'dummy');

    // Test loading an existing request
    const testRequest = { id: 'req1', name: 'Test Request' };
    mockHandleLoadRequest(testRequest, mockTabs, mockT);

    // Verify confirm was NOT called
    expect(mockConfirm).not.toHaveBeenCalled();

    // Verify switched to existing tab
    expect(mockTabs.switchTab).toHaveBeenCalledWith('tab1');

    // Verify new tab was NOT opened
    expect(mockTabs.openTab).not.toHaveBeenCalled();
  });
});
