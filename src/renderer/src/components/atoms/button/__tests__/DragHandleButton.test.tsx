import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { DragHandleButton } from '../DragHandleButton';

describe('DragHandleButton', () => {
  it('renders icon', () => {
    const { container } = render(<DragHandleButton />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onPointerDown when pressed', () => {
    const handle = vi.fn();
    const { getByRole } = render(<DragHandleButton onPointerDown={handle} />);
    fireEvent.pointerDown(getByRole('button'));
    expect(handle).toHaveBeenCalled();
  });

  it('has aria-label="ドラッグで並び替え"', () => {
    const { getByRole } = render(<DragHandleButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'ドラッグで並び替え');
  });
});
