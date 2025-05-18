import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestActionMenu } from '../RequestActionMenu';
import '../../../i18n';

describe('RequestActionMenu', () => {
  it('calls handlers', () => {
    const move = vi.fn();
    const del = vi.fn();
    const { getByText } = render(<RequestActionMenu onMove={move} onDelete={del} />);
    fireEvent.click(getByText('Move to Folder'));
    expect(move).toHaveBeenCalled();
    fireEvent.click(getByText('Delete'));
    expect(del).toHaveBeenCalled();
  });
});
