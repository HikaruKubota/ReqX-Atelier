import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestCollectionTree } from '../RequestCollectionTree';
import type { SavedRequest, SavedFolder } from '../../types';
import '../../i18n';

const requests: SavedRequest[] = [{ id: '1', name: 'req', method: 'GET', url: '/' }];
const folders: SavedFolder[] = [];

const baseProps = {
  folders,
  requests,
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

describe('RequestCollectionTree', () => {
  it('calls onLoadRequest when activated via keyboard', () => {
    const fn = vi.fn();
    const { container } = render(<RequestCollectionTree {...baseProps} onLoadRequest={fn} />);
    const tree = container.querySelector('[role="tree"]') as HTMLElement;
    const treeitem = container.querySelector('[role="treeitem"]') as HTMLElement;
    fireEvent.click(treeitem);
    fireEvent.keyDown(tree, { key: 'Enter' });
    expect(fn).toHaveBeenCalledWith(requests[0]);
  });

  it('adds selected style when item is clicked', () => {
    const { container } = render(<RequestCollectionTree {...baseProps} />);
    const treeitem = container.querySelector('[role="treeitem"]') as HTMLElement;
    fireEvent.click(treeitem);
    const inner = treeitem.firstElementChild as HTMLElement;
    expect(inner).toHaveClass('bg-blue-100');
  });
});
