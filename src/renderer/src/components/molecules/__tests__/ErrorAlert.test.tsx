import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorAlert } from '../ErrorAlert';

const sampleError = { message: 'Something went wrong' };

describe('ErrorAlert', () => {
  it('renders error message', () => {
    const { getByText } = render(<ErrorAlert error={sampleError} />);
    expect(getByText('Error Details:')).toBeInTheDocument();
    expect(getByText(sampleError.message)).toBeInTheDocument();
  });

  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorAlert error={null} />);
    expect(container.firstChild).toBeNull();
  });
});
