import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders message when open', () => {
    const { getByText } = render(<Toast message="test" isOpen={true} />);
    expect(getByText('test')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { queryByText } = render(<Toast message="hidden" isOpen={false} />);
    expect(queryByText('hidden')).toBeNull();
  });

  it('calls action when button clicked', () => {
    const fn = vi.fn();
    const { getByText } = render(
      <Toast message="delete" isOpen actionLabel="Undo" onAction={fn} />,
    );
    getByText('Undo').click();
    expect(fn).toHaveBeenCalled();
  });
});
