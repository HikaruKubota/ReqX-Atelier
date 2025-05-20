import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeadersEditor } from '../HeadersEditor';
import type { RequestHeader } from '../../types';
import '../../i18n';

describe('HeadersEditor', () => {
  const headers: RequestHeader[] = [{ id: 'h1', key: '', value: '', enabled: true }];

  it('calls update and remove handlers', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const { getByPlaceholderText, getByText, getByLabelText } = render(
      <HeadersEditor
        headers={headers}
        onAddHeader={onAdd}
        onUpdateHeader={onUpdate}
        onRemoveHeader={onRemove}
        onMoveHeader={onMove}
      />,
    );

    fireEvent.change(getByPlaceholderText('Key'), { target: { value: 'A' } });
    expect(onUpdate).toHaveBeenCalledWith('h1', 'key', 'A');

    fireEvent.click(getByLabelText('削除'));
    expect(onRemove).toHaveBeenCalledWith('h1');

    fireEvent.click(getByText('Add Header'));
    expect(onAdd).toHaveBeenCalled();
  });
});
