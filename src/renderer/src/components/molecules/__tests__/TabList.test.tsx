import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../i18n';
import { TabList } from '../TabList';

describe('TabList', () => {
  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    const onNew = vi.fn();
    const { getByText } = render(
      <TabList
        tabs={[{ tabId: '1', name: 'Tab1' }]}
        activeTabId="1"
        onSelect={onSelect}
        onClose={() => {}}
        onNew={onNew}
      />,
    );
    fireEvent.click(getByText('Tab1'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('calls onNew when new button clicked', () => {
    const onNew = vi.fn();
    const { getByLabelText } = render(
      <TabList tabs={[]} activeTabId={null} onSelect={() => {}} onClose={() => {}} onNew={onNew} />,
    );
    fireEvent.click(getByLabelText('新しいリクエスト'));
    expect(onNew).toHaveBeenCalled();
  });

  it('shows unsaved indicator when unsaved', () => {
    const { getByLabelText } = render(
      <TabList
        tabs={[{ tabId: '1', name: 'Tab1', unsaved: true }]}
        activeTabId="1"
        onSelect={() => {}}
        onClose={() => {}}
        onNew={() => {}}
      />,
    );
    expect(getByLabelText('未保存')).toBeInTheDocument();
  });
});
