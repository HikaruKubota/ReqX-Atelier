import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FolderListItem } from '../FolderListItem';
import type { RequestFolder } from '../../../../types';

describe('FolderListItem', () => {
  it('calls onToggle when clicked', () => {
    const folder: RequestFolder = { id: '1', name: 'F1' };
    const toggle = vi.fn();
    const { getByText } = render(
      <FolderListItem folder={folder} isOpen={false} onToggle={toggle} />,
    );
    fireEvent.click(getByText('F1'));
    expect(toggle).toHaveBeenCalled();
  });
});
