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
  bodyKeyValuePairs: [],
};

describe('RequestListItem', () => {
  it.skip('renders request name', () => {
    const { getByText } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={() => {}}
        onDelete={() => {}}
        onMove={() => {}}
      />,
    );
    expect(getByText('テストリクエスト')).toBeInTheDocument();
  });

  it.skip('calls onClick when item is clicked', () => {
    const handleClick = vi.fn();
    const { getByText } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={handleClick}
        onDelete={() => {}}
        onMove={() => {}}
      />,
    );
    fireEvent.click(getByText('テストリクエスト'));
    expect(handleClick).toHaveBeenCalled();
  });

  it.skip('calls onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    const { getByRole } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={() => {}}
        onDelete={handleDelete}
        onMove={() => {}}
      />,
    );
    fireEvent.click(getByRole('button'));
    expect(handleDelete).toHaveBeenCalled();
  });

  it.skip('applies active style when isActive is true', () => {
    const { container } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={true}
        onClick={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(container.firstChild).toHaveClass('bg-gray-200');
    expect(container.firstChild).toHaveClass('font-bold');
  });
});
