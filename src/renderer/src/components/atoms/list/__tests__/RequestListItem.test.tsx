import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestListItem } from '../RequestListItem';
import type { SavedRequest } from '../../../../types';

const sampleRequest: SavedRequest = {
  id: '1',
  name: 'テストリクエスト',
  method: 'GET',
  url: 'https://api.example.com',
  headers: [],
  body: [],
};

describe('RequestListItem', () => {
  it('renders request name', () => {
    const { getByText } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(getByText('テストリクエスト')).toBeInTheDocument();
  });

  it('calls onClick when item is clicked', () => {
    const handleClick = vi.fn();
    const { getByText } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={handleClick}
        onDelete={() => {}}
      />,
    );
    fireEvent.click(getByText('テストリクエスト'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    const { getByRole } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={() => {}}
        onDelete={handleDelete}
      />,
    );
    fireEvent.click(getByRole('button'));
    expect(handleDelete).toHaveBeenCalled();
  });

  it('applies active style when isActive is true', () => {
    const { container } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={true}
        onClick={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(container.firstChild).toHaveClass('font-bold');
    expect(container.firstChild).toHaveClass('border-gray-400');
  });
});
