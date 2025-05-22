import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { FolderListItem } from '../FolderListItem';
import type { SavedFolder } from '../../../../types';

const sampleFolder: SavedFolder = {
  id: 'folder1',
  name: 'Sample',
  parentFolderId: null,
  requestIds: [],
  subFolderIds: [],
};

describe('FolderListItem', () => {
  it('renders folder name', () => {
    const { getByText } = render(
      <FolderListItem folder={sampleFolder} depth={0} collapsed={false} onToggle={() => {}} />,
    );
    expect(getByText('Sample')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    const { getByText } = render(
      <FolderListItem folder={sampleFolder} depth={0} collapsed={false} onToggle={handleToggle} />,
    );
    fireEvent.click(getByText('Sample'));
    expect(handleToggle).toHaveBeenCalledWith('folder1');
  });
});
