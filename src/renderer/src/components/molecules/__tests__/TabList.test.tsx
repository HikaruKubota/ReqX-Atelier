import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../i18n';
import { TabList } from '../TabList';

describe('TabList', () => {
  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    const onNew = vi.fn();
    const { getByText, getByLabelText } = render(
      <TabList
        tabs={[{ tabId: '1', name: 'Tab1', method: 'GET' }]}
        activeTabId="1"
        onSelect={onSelect}
        onClose={() => {}}
        onNew={onNew}
      />,
    );
    fireEvent.click(getByText('Tab1'));
    expect(onSelect).toHaveBeenCalledWith('1');
    expect(getByLabelText('GETリクエスト')).toBeInTheDocument();
  });

  it('calls onNew when new button clicked', () => {
    const onNew = vi.fn();
    const { getByLabelText } = render(
      <TabList tabs={[]} activeTabId={null} onSelect={() => {}} onClose={() => {}} onNew={onNew} />,
    );
    fireEvent.click(getByLabelText('新しいリクエスト'));
    expect(onNew).toHaveBeenCalled();
  });
});
