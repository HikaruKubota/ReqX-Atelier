import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestNameRow } from '../RequestNameRow';
import '../../../i18n';

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
    fireEvent.change(getByPlaceholderText('リクエスト名 (例: Get User Details)'), {
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
    fireEvent.click(getByText('リクエストを保存'));
    expect(handleSave).toHaveBeenCalled();
  });
});
