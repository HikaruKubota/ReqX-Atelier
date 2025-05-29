import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../i18n';
import { TabList } from '../TabList';
import { useSavedRequestsStore } from '../../../store/savedRequestsStore';

describe('TabList', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    useSavedRequestsStore.getState().setRequests([]);
  });
  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    const onNew = vi.fn();
    useSavedRequestsStore.getState().setRequests([
      {
        id: 'req1',
        name: 'Tab1',
        method: 'GET',
        url: 'https://example.com',
        headers: [],
        body: [],
        params: [],
      },
    ]);
    const { getByText, getByLabelText } = render(
      <TabList
        tabs={[{ tabId: '1', requestId: 'req1', isDirty: false }]}
        activeTabId="1"
        onSelect={onSelect}
        onClose={() => {}}
        onNew={onNew}
        onReorder={() => {}}
      />,
    );
    fireEvent.click(getByText('Tab1'));
    expect(onSelect).toHaveBeenCalledWith('1');
    expect(getByLabelText('GETリクエスト')).toBeInTheDocument();
  });

  it('calls onNew when new button clicked', () => {
    const onNew = vi.fn();
    const { getByLabelText } = render(
      <TabList
        tabs={[]}
        activeTabId={null}
        onSelect={() => {}}
        onClose={() => {}}
        onNew={onNew}
        onReorder={() => {}}
      />,
    );
    fireEvent.click(getByLabelText('新しいリクエスト'));
    expect(onNew).toHaveBeenCalled();
  });

  it('scrolls active tab into view', async () => {
    useSavedRequestsStore.getState().setRequests([
      {
        id: 'req1',
        name: 'Tab1',
        method: 'GET',
        url: 'https://example.com',
        headers: [],
        body: [],
        params: [],
      },
      {
        id: 'req2',
        name: 'Tab2',
        method: 'POST',
        url: 'https://example.com',
        headers: [],
        body: [],
        params: [],
      },
    ]);
    const { rerender } = render(
      <TabList
        tabs={[
          { tabId: '1', requestId: 'req1', isDirty: false },
          { tabId: '2', requestId: 'req2', isDirty: false },
        ]}
        activeTabId="1"
        onSelect={() => {}}
        onClose={() => {}}
        onNew={() => {}}
        onReorder={() => {}}
      />,
    );
    rerender(
      <TabList
        tabs={[
          { tabId: '1', requestId: 'req1', isDirty: false },
          { tabId: '2', requestId: 'req2', isDirty: false },
        ]}
        activeTabId="2"
        onSelect={() => {}}
        onClose={() => {}}
        onNew={() => {}}
        onReorder={() => {}}
      />,
    );
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });
});
