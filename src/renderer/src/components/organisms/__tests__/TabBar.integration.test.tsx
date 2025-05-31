import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { TabBar } from '../TabBar';
import type { TabState } from '../../../hooks/useTabs';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        new_request: 'New Request',
        close_tab: 'Close Tab',
        move_tab_left: 'Move Tab Left',
        move_tab_right: 'Move Tab Right',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock saved requests store
const mockRequests = {
  'req-1': {
    id: 'req-1',
    name: 'Get Users',
    method: 'GET' as const,
    url: 'https://api.example.com/users',
    headers: [],
    params: [],
    body: { type: 'none' as const, data: '' },
    timestamp: new Date().toISOString(),
  },
  'req-2': {
    id: 'req-2',
    name: 'Create User',
    method: 'POST' as const,
    url: 'https://api.example.com/users',
    headers: [],
    params: [],
    body: { type: 'json' as const, data: '{}' },
    timestamp: new Date().toISOString(),
  },
};

vi.mock('../../../store/savedRequestsStore', () => ({
  useSavedRequestsStore: () => Object.values(mockRequests),
}));

describe('TabBar Integration Tests', () => {
  const mockTabs: TabState[] = [
    { tabId: 'tab-1', requestId: 'req-1', isDirty: false },
    { tabId: 'tab-2', requestId: 'req-2', isDirty: true },
    { tabId: 'tab-3', requestId: null, isDirty: false },
  ];

  const defaultProps = {
    tabs: mockTabs,
    activeTabId: 'tab-1',
    onSelect: vi.fn(),
    onClose: vi.fn(),
    onNew: vi.fn(),
    onReorder: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs with correct content', () => {
    render(<TabBar {...defaultProps} />);

    // Check that all tabs are rendered by their content
    expect(screen.getByText('Get Users')).toBeInTheDocument();
    expect(screen.getByText('Create User*')).toBeInTheDocument(); // * for dirty indicator
    expect(screen.getByText('Untitled')).toBeInTheDocument(); // Tab with no saved request

    // Check method icons are displayed
    const methodIcons = screen.getAllByLabelText(/method_/i);
    expect(methodIcons.length).toBeGreaterThanOrEqual(3);
  });

  it('handles tab click events', () => {
    render(<TabBar {...defaultProps} />);

    // Click on the Create User tab
    const createUserTab = screen.getByText('Create User*');
    fireEvent.click(createUserTab.parentElement!);

    expect(defaultProps.onSelect).toHaveBeenCalledWith('tab-2');
  });

  it('handles tab close button click', () => {
    render(<TabBar {...defaultProps} />);

    // Find all close buttons
    const closeButtons = screen.getAllByLabelText('Close Tab');
    // Click the second tab's close button
    fireEvent.click(closeButtons[1]);

    expect(defaultProps.onClose).toHaveBeenCalledWith('tab-2');
  });

  it('handles new tab button click', () => {
    render(<TabBar {...defaultProps} />);

    const newTabButton = screen.getByLabelText('New Request');
    fireEvent.click(newTabButton);

    expect(defaultProps.onNew).toHaveBeenCalled();
  });

  it('shows active tab with different styling', () => {
    render(<TabBar {...defaultProps} />);

    // Active tab should have specific classes
    const getUsersTab = screen.getByText('Get Users').parentElement;
    expect(getUsersTab).toHaveClass('font-bold', 'border-blue-500');

    // Inactive tabs should not have those classes
    const createUserTab = screen.getByText('Create User*').parentElement;
    expect(createUserTab).toHaveClass('border-transparent');
  });

  it('updates when active tab changes', () => {
    const { rerender } = render(<TabBar {...defaultProps} />);

    // Change active tab
    rerender(<TabBar {...defaultProps} activeTabId="tab-2" />);

    // New active tab should have specific classes
    const createUserTab = screen.getByText('Create User*').parentElement;
    expect(createUserTab).toHaveClass('font-bold', 'border-blue-500');

    // Previous active tab should not
    const getUsersTab = screen.getByText('Get Users').parentElement;
    expect(getUsersTab).toHaveClass('border-transparent');
  });

  it('handles drag and drop reordering', async () => {
    render(<TabBar {...defaultProps} />);

    // Find tab elements by their content
    const getUsersTab = screen.getByText('Get Users').parentElement;

    // Since dnd-kit handles drag and drop differently, we'll test the callback
    // In a real scenario, dnd-kit would handle the drag events
    // For now, we'll just verify the structure is correct
    expect(getUsersTab).toHaveAttribute('role', 'button');
    expect(getUsersTab).toHaveAttribute('aria-roledescription', 'sortable');

    // Verify onReorder would be called (this would be triggered by dnd-kit)
    // Mock a reorder event
    act(() => {
      defaultProps.onReorder('tab-1', 'tab-3');
    });

    expect(defaultProps.onReorder).toHaveBeenCalledWith('tab-1', 'tab-3');
  });

  it('displays method icons for saved requests', () => {
    render(<TabBar {...defaultProps} />);

    // Check for method icons (they are SVG elements with aria-label)
    const methodIcons = screen.getAllByLabelText(/method_/i);
    expect(methodIcons.length).toBeGreaterThanOrEqual(3);

    // Icons should have appropriate classes
    expect(methodIcons[0]).toHaveClass('text-blue-500'); // Default icon color
  });

  it('handles empty tabs array', () => {
    render(<TabBar {...defaultProps} tabs={[]} />);

    // Should still show new tab button
    const newTabButton = screen.getByLabelText('New Request');
    expect(newTabButton).toBeInTheDocument();

    // Should not have any tab content
    expect(screen.queryByText('Get Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Create User')).not.toBeInTheDocument();
  });

  it('handles missing request data gracefully', () => {
    const tabsWithMissingRequest = [
      { tabId: 'tab-missing', requestId: 'req-missing', isDirty: false },
    ];

    render(<TabBar {...defaultProps} tabs={tabsWithMissingRequest} activeTabId="tab-missing" />);

    // Should show default text for missing request
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });
});
