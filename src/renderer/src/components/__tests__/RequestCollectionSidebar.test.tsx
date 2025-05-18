import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../i18n';
import { RequestCollectionSidebar } from '../RequestCollectionSidebar';
import type { SavedRequest } from '../types';

const baseProps = {
  savedRequests: [] as SavedRequest[],
  activeRequestId: null,
  onNewRequest: () => {},
  onLoadRequest: () => {},
  onDeleteRequest: () => {},
};

describe('RequestCollectionSidebar', () => {
  it('shows full width when open', () => {
    const { getByTestId, getByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar').style.width).toBe('250px');
    expect(getByText('My Collection')).toBeInTheDocument();
  });

  it('collapses when closed', () => {
    const { getByTestId, queryByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen={false} onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar').style.width).toBe('40px');
    expect(queryByText('My Collection')).toBeNull();
  });

  it('fires onToggle when button clicked', () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={fn} />,
    );
    fireEvent.click(getByLabelText('サイドバーを隠す'));
    expect(fn).toHaveBeenCalled();
  });
});
