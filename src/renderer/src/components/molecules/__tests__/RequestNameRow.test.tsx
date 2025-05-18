import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestNameRow } from '../RequestNameRow';

describe('RequestNameRow', () => {
  it('calls onChange when input changes', () => {
    const handleChange = vi.fn();
    const { getByPlaceholderText } = render(
      <RequestNameRow
        value=""
        onChange={handleChange}
        onSave={() => {}}
        saving={false}
        isUpdate={false}
      />,
    );
    fireEvent.change(getByPlaceholderText('Request Name (e.g., Get User Details)'), {
      target: { value: 'test' },
    });
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('calls onSave when button clicked', () => {
    const handleSave = vi.fn();
    const { getByText } = render(
      <RequestNameRow
        value="name"
        onChange={() => {}}
        onSave={handleSave}
        saving={false}
        isUpdate={false}
      />,
    );
    fireEvent.click(getByText('Save Request'));
    expect(handleSave).toHaveBeenCalled();
  });
});
