import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../i18n';
import { RequestCollectionTree } from '../RequestCollectionTree';
import type { SavedRequest, SavedFolder } from '../../types';

describe('RequestCollectionTree keyboard', () => {
  it('calls onLoadRequest when Enter key pressed', () => {
    const request: SavedRequest = {
      id: '1',
      name: 'テストリクエスト',
      method: 'GET',
      url: '',
    };
    const folders: SavedFolder[] = [];
    const handleLoad = vi.fn();

    const { getByRole } = render(
      <RequestCollectionTree
        folders={folders}
        requests={[request]}
        activeRequestId={null}
        onLoadRequest={handleLoad}
        onDeleteRequest={() => {}}
        onCopyRequest={() => {}}
        onAddFolder={() => {}}
        onAddRequest={() => {}}
        onRenameFolder={() => {}}
        onDeleteFolder={() => {}}
        moveRequest={() => {}}
        moveFolder={() => {}}
      />,
    );

    const wrapper = getByRole('treeitem');
    // the actual row element with handler is the first child
    fireEvent.keyDown(wrapper.firstChild as HTMLElement, { key: 'Enter' });
    expect(handleLoad).toHaveBeenCalledWith(request);
  });
});
