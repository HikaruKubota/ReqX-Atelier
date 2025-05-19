import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
});
