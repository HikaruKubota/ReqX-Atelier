import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders children when open', () => {
    const { getByText } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>content</div>
      </Modal>
    );
    expect(getByText('content')).toBeTruthy();
  });

  it('does not render when closed', () => {
    const { queryByText } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>content</div>
      </Modal>
    );
    expect(queryByText('content')).toBeNull();
  });

  it('calls onClose on background click', () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>content</div>
      </Modal>
    );
    fireEvent.click(getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('applies size classes to panel', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <div>content</div>
      </Modal>,
    );
    const panel = container.querySelector('.max-w-lg');
    expect(panel).toBeTruthy();
  });
});
