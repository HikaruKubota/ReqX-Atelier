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
    const { getByText } = render(<RequestListItem request={sampleRequest} isActive={false} />);
    expect(getByText('テストリクエスト')).toBeInTheDocument();
  });

  it('renders method icon with aria-label', () => {
    const { getByLabelText } = render(<RequestListItem request={sampleRequest} isActive={false} />);
    expect(getByLabelText('GETリクエスト')).toBeInTheDocument();
  });

  it('applies active style when isActive is true', () => {
    const { container } = render(<RequestListItem request={sampleRequest} isActive={true} />);
    expect(container.firstChild).toHaveClass('font-bold');
  });

  it('applies selected style when isSelected is true', () => {
    const { container } = render(
      <RequestListItem request={sampleRequest} isActive={false} isSelected />,
    );
    expect(container.firstChild).toHaveClass('bg-blue-100');
  });

  it('calls onContextMenu when right clicked', () => {
    const handleContext = vi.fn();
    const { getByText } = render(
      <RequestListItem request={sampleRequest} isActive={false} onContextMenu={handleContext} />,
    );
    fireEvent.contextMenu(getByText('テストリクエスト'));
    expect(handleContext).toHaveBeenCalled();
  });
});
