import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestFolderRow } from '../RequestFolderRow';
import type { RequestFolder } from '../../../types';

describe('RequestFolderRow', () => {
  const folders: RequestFolder[] = [
    { id: '1', name: 'Default' },
    { id: '2', name: 'Other' },
  ];

  it('renders options', () => {
    const { getByDisplayValue } = render(
      <RequestFolderRow folders={folders} value="1" onChange={() => {}} />,
    );
    expect(getByDisplayValue('Default')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    const { getByRole } = render(
      <RequestFolderRow folders={folders} value="1" onChange={handleChange} />,
    );
    fireEvent.change(getByRole('combobox'), { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalledWith('2');
  });
});
