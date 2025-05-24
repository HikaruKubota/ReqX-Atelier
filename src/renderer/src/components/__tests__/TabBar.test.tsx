import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../i18n';
import { TabBar } from '../organisms/TabBar';
import { useSavedRequestsStore } from '../../store/savedRequestsStore';

describe('TabBar', () => {
  it('handles tab selection, closing, and new tab creation', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const onNew = vi.fn();
    const onReorder = vi.fn();
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
    const tabs = [{ tabId: '1', requestId: 'req1' }];
    const { getByText, getByLabelText } = render(
      <TabBar
        tabs={tabs}
        activeTabId="1"
        onSelect={onSelect}
        onClose={onClose}
        onNew={onNew}
        onReorder={onReorder}
      />,
    );
    fireEvent.click(getByText('Tab1'));
    expect(onSelect).toHaveBeenCalledWith('1');
    expect(getByLabelText('GETリクエスト')).toBeInTheDocument();

    fireEvent.click(getByLabelText('タブを閉じる'));
    expect(onClose).toHaveBeenCalledWith('1');

    fireEvent.click(getByLabelText('新しいリクエスト'));
    expect(onNew).toHaveBeenCalled();
  });
});
