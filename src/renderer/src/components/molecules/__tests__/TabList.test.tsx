import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabList } from '../TabList';

describe('TabList', () => {
  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <TabList
        tabs={[{ tabId: '1', name: 'Tab1' }]}
        activeTabId="1"
        onSelect={onSelect}
        onClose={() => {}}
      />,
    );
    fireEvent.click(getByText('Tab1'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
