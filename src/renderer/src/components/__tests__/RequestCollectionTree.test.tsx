import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestCollectionTree } from '../RequestCollectionTree';
import i18n from '../../i18n';
import type { SavedFolder, SavedRequest } from '../../types';

const folders: SavedFolder[] = [
  { id: 'f1', name: 'Folder', parentFolderId: null, requestIds: [], subFolderIds: [] },
];
const requests: SavedRequest[] = [];

const baseProps = {
  folders,
  requests,
  activeRequestId: null,
  onLoadRequest: () => {},
  onDeleteRequest: () => {},
  onCopyRequest: () => {},
  onAddFolder: () => {},
  onAddRequest: () => {},
  updateFolder: vi.fn(),
  onDeleteFolder: () => {},
  moveRequest: () => {},
  moveFolder: () => {},
};

describe('RequestCollectionTree', () => {
  it('renames folder on blur', async () => {
    const update = vi.fn();
    const { getByText, findByDisplayValue } = render(
      <RequestCollectionTree {...baseProps} updateFolder={update} />,
    );
    fireEvent.contextMenu(getByText('Folder'));
    fireEvent.click(getByText(i18n.t('context_menu_rename_folder')));

    const input = (await findByDisplayValue('Folder')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'NewName' } });
    const updated = await findByDisplayValue('NewName');
    updated.focus();
    fireEvent.blur(updated);
    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('f1', { name: 'NewName' });
    });
  });

  it('cancels rename on escape', async () => {
    const update = vi.fn();
    const { getByText, findByDisplayValue } = render(
      <RequestCollectionTree {...baseProps} updateFolder={update} />,
    );
    fireEvent.contextMenu(getByText('Folder'));
    fireEvent.click(getByText(i18n.t('context_menu_rename_folder')));
    const input = (await findByDisplayValue('Folder')) as HTMLInputElement;
    input.focus();
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => {
      expect(update).not.toHaveBeenCalled();
    });
  });
});
