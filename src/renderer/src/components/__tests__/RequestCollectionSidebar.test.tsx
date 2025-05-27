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
};

describe('RequestCollectionSidebar', () => {
  it('shows full width when open', () => {
    const { getByTestId, getByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar').style.width).toBe('250px');
    expect(getByText(i18n.t('collection_title'))).toBeInTheDocument();
  });

  it('collapses when closed', () => {
    const { getByTestId, queryByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen={false} onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar').style.width).toBe('40px');
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

  it('uses active request folder when creating items', () => {
    const onAddFolder = vi.fn();
    const onAddRequest = vi.fn();
    const folderId = 'folder1';
    const requestId = 'req1';
    const props = {
      ...baseProps,
      savedFolders: [
        {
          id: folderId,
          name: 'F',
          parentFolderId: null,
          requestIds: [requestId],
          subFolderIds: [],
        },
      ],
      savedRequests: [
        { id: requestId, name: 'R', method: 'GET', url: '/', headers: [], body: [], params: [] },
      ],
      activeRequestId: requestId,
      onAddFolder,
      onAddRequest,
    };
    const { getByLabelText } = render(
      <RequestCollectionSidebar {...props} isOpen onToggle={() => {}} />,
    );
    fireEvent.click(getByLabelText('新しいフォルダ'));
    fireEvent.click(getByLabelText('新しいリクエスト'));
    expect(onAddFolder).toHaveBeenCalledWith(folderId);
    expect(onAddRequest).toHaveBeenCalledWith(folderId);
  });

  it('uses active folder when creating items', () => {
    const onAddFolder = vi.fn();
    const onAddRequest = vi.fn();
    const folderId = 'folder1';
    const props = {
      ...baseProps,
      savedFolders: [
        { id: folderId, name: 'F', parentFolderId: null, requestIds: [], subFolderIds: [] },
      ],
      activeRequestId: null,
      onAddFolder,
      onAddRequest,
    };
    const { getByLabelText, getByText } = render(
      <RequestCollectionSidebar {...props} isOpen onToggle={() => {}} />,
    );
    fireEvent.click(getByText('F'));
    fireEvent.click(getByLabelText('新しいフォルダ'));
    fireEvent.click(getByLabelText('新しいリクエスト'));
    expect(onAddFolder).toHaveBeenCalledWith(folderId);
    expect(onAddRequest).toHaveBeenCalledWith(folderId);
  });

  it('shows resize handle when open', () => {
    const { getByLabelText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={() => {}} />,
    );
    expect(getByLabelText('サイドバーの幅を調整')).toBeInTheDocument();
  });
});
