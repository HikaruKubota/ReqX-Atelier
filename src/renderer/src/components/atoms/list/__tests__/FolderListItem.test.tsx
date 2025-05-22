import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { FolderListItem } from '../FolderListItem';
import type { SavedFolder } from '../../../../types';

describe('FolderListItem', () => {
  const folder: SavedFolder = {
    id: 'f1',
    name: 'Test',
    parentFolderId: null,
    requestIds: [],
    subFolderIds: [],
  };

  it('shows folder name', () => {
    const { getByText } = render(
      <FolderListItem folder={folder} isOpen={false} onToggle={() => {}} />,
    );
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const fn = vi.fn();
    const { getByText } = render(<FolderListItem folder={folder} isOpen={false} onToggle={fn} />);
    fireEvent.click(getByText('Test'));
    expect(fn).toHaveBeenCalled();
  });

  it('calls onContextMenu', () => {
    const fn = vi.fn();
    const { getByText } = render(
      <FolderListItem folder={folder} isOpen={false} onToggle={() => {}} onContextMenu={fn} />,
    );
    fireEvent.contextMenu(getByText('Test'));
    expect(fn).toHaveBeenCalled();
  });
});
