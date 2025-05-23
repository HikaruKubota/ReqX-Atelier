import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../i18n';
import { RequestCollectionSidebar } from '../RequestCollectionSidebar';
import { RenameFolderModal } from '../RenameFolderModal';
import type { SavedFolder } from '../../types';

const folder: SavedFolder = {
  id: 'f1',
  name: 'Folder1',
  parentFolderId: null,
  requestIds: [],
  subFolderIds: [],
};

describe('RenameFolder flow', () => {
  it('opens modal and calls updateFolder on save', () => {
    const updateFolder = vi.fn();
    const Wrapper: React.FC = () => {
      const [renameId, setRenameId] = useState<string | null>(null);
      const [name, setName] = useState('');
      return (
        <>
          <RequestCollectionSidebar
            savedRequests={[]}
            savedFolders={[folder]}
            activeRequestId={null}
            onLoadRequest={() => {}}
            onDeleteRequest={() => {}}
            onCopyRequest={() => {}}
            onAddFolder={() => {}}
            onAddRequest={() => {}}
            onRenameFolder={(id) => {
              setRenameId(id);
              setName(folder.name);
            }}
            onDeleteFolder={() => {}}
            moveRequest={() => {}}
            moveFolder={() => {}}
            isOpen
            onToggle={() => {}}
          />
          <RenameFolderModal
            isOpen={renameId !== null}
            initialName={name}
            onClose={() => setRenameId(null)}
            onSave={(newName) => {
              updateFolder(renameId!, { name: newName });
              setRenameId(null);
            }}
          />
        </>
      );
    };

    const { getByText, getByPlaceholderText } = render(<Wrapper />);

    fireEvent.contextMenu(getByText('Folder1'), { clientX: 0, clientY: 0 });
    fireEvent.click(getByText('フォルダの名前を変更'));

    const input = getByPlaceholderText('フォルダ名を入力') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated' } });

    fireEvent.click(getByText('名前を変更'));
    expect(updateFolder).toHaveBeenCalledWith('f1', { name: 'Updated' });
  });
});
