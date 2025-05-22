import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
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
      <RequestListItem request={sampleRequest} isActive={false} onClick={() => {}} />,
    );
    expect(getByText('テストリクエスト')).toBeInTheDocument();
  });

  it('renders method icon with aria-label', () => {
    const { getByLabelText } = render(
      <RequestListItem request={sampleRequest} isActive={false} onClick={() => {}} />,
    );
    expect(getByLabelText('GETリクエスト')).toBeInTheDocument();
  });

  it('calls onClick when item is clicked', () => {
    const handleClick = vi.fn();
    const { getByText } = render(
      <RequestListItem request={sampleRequest} isActive={false} onClick={handleClick} />,
    );
    fireEvent.click(getByText('テストリクエスト'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies active style when isActive is true', () => {
    const { container } = render(
      <RequestListItem request={sampleRequest} isActive={true} onClick={() => {}} />,
    );
    expect(container.firstChild).toHaveClass('font-bold');
    expect(container.firstChild).toHaveClass('border-gray-400');
  });

  it('calls onContextMenu when right clicked', () => {
    const handleContext = vi.fn();
    const { getByText } = render(
      <RequestListItem
        request={sampleRequest}
        isActive={false}
        onClick={() => {}}
        onContextMenu={handleContext}
      />,
    );
    fireEvent.contextMenu(getByText('テストリクエスト'));
    expect(handleContext).toHaveBeenCalled();
  });

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <RequestListItem request={sampleRequest} isActive={false} onClick={handleClick} />,
    );
    fireEvent.keyDown(getByRole('treeitem'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
});
