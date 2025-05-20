import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContextMenu } from '../ContextMenu';

describe('ContextMenu', () => {
  it('renders items', () => {
    const { getByText } = render(
      <ContextMenu
        position={{ x: 0, y: 0 }}
        items={[{ label: 'A' }, { label: 'B' }]}
        onClose={() => {}}
      />,
    );
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
  });

  it('calls onClose when clicking outside', () => {
    const onClose = vi.fn();
    render(
      <ContextMenu position={{ x: 0, y: 0 }} items={[]} onClose={onClose} />,
    );
    fireEvent.click(document.body);
    expect(onClose).toHaveBeenCalled();
  });
});
