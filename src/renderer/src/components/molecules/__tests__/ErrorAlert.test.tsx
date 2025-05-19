import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorAlert } from '../ErrorAlert';
import '../../../i18n';

const sampleError = { message: 'Something went wrong' };

describe('ErrorAlert', () => {
  it('renders error message', () => {
    const { getByText } = render(<ErrorAlert error={sampleError} />);
    expect(getByText('エラー詳細:')).toBeInTheDocument();
    expect(getByText(sampleError.message)).toBeInTheDocument();
  });

  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorAlert error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onCopy when copy button clicked', () => {
    const fn = vi.fn();
    const { getByRole } = render(<ErrorAlert error={sampleError} onCopy={fn} />);
    getByRole('button').click();
    expect(fn).toHaveBeenCalled();
  });
});
