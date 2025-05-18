import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FolderList } from '../FolderList';

const folders = [{ id: 'f1', name: 'F1' }];
const requests = [
  { id: 'r1', name: 'R1', method: 'GET', url: '', folderId: 'f1' },
];

describe('FolderList', () => {
  it('renders folder and request', () => {
    const { getByText } = render(
      <FolderList
        folders={folders}
        requests={requests}
        activeRequestId={null}
        onSelectRequest={() => {}}
        onDeleteRequest={() => {}}
      />,
    );
    expect(getByText('F1')).toBeInTheDocument();
    fireEvent.click(getByText('F1'));
    expect(getByText('R1')).toBeInTheDocument();
  });
});
