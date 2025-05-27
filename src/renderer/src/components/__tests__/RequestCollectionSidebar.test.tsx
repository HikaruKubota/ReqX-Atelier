import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import i18n from '../../i18n';
import { RequestCollectionSidebar } from '../RequestCollectionSidebar';
import type { SavedRequest } from '../../types';

const baseProps = {
  savedRequests: [] as SavedRequest[],
  savedFolders: [],
  activeRequestId: null,
  onLoadRequest: () => {},
  onDeleteRequest: () => {},
  onCopyRequest: () => {},
  onAddFolder: () => {},
  onAddRequest: () => {},
  onDeleteFolder: () => {},
  onCopyFolder: () => {},
  moveRequest: () => {},
  moveFolder: () => {},
  onOpenFolder: () => {},
};

describe('RequestCollectionSidebar', () => {
  it('shows full width when open', () => {
    const { getByTestId, getByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar')).toHaveClass('w-[250px]');
    expect(getByText(i18n.t('collection_title'))).toBeInTheDocument();
  });

  it('collapses when closed', () => {
    const { getByTestId, queryByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen={false} onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar')).toHaveClass('w-[40px]');
    expect(queryByText(i18n.t('collection_title'))).toBeNull();
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
