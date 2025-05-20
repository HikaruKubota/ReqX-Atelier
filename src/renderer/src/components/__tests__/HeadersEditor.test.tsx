import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeadersEditor } from '../HeadersEditor';
import type { RequestHeader } from '../../types';
import type { HeadersEditorRef } from '../HeadersEditor';
import i18n from '../../i18n';

describe('HeadersEditor', () => {
  const headers: RequestHeader[] = [{ id: 'h1', key: '', value: '', enabled: true }];

  it('calls update and remove handlers', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onReorder = vi.fn();
    const { getByPlaceholderText, getByText, getByLabelText } = render(
      <HeadersEditor
        headers={headers}
        onAddHeader={onAdd}
        onUpdateHeader={onUpdate}
        onRemoveHeader={onRemove}
        onReorderHeaders={onReorder}
      />,
    );

    fireEvent.change(getByPlaceholderText('Key'), { target: { value: 'A' } });
    expect(onUpdate).toHaveBeenCalledWith('h1', 'key', 'A');

    fireEvent.click(getByLabelText('削除'));
    expect(onRemove).toHaveBeenCalledWith('h1');

    fireEvent.click(getByText(i18n.t('add_header')));
    expect(onAdd).toHaveBeenCalled();
  });

  it('reorders rows via triggerDrag', () => {
    const ref = React.createRef<HeadersEditorRef>();
    const Wrapper = () => {
      const [hdrs, setHdrs] = React.useState<RequestHeader[]>([
        { id: 'h1', key: 'A', value: '1', enabled: true },
        { id: 'h2', key: 'B', value: '2', enabled: true },
      ]);
      return (
        <HeadersEditor
          ref={ref}
          headers={hdrs}
          onAddHeader={() => {}}
          onUpdateHeader={() => {}}
          onRemoveHeader={() => {}}
          onReorderHeaders={setHdrs}
        />
      );
    };
    const { getAllByPlaceholderText } = render(<Wrapper />);
    const keyInputs = getAllByPlaceholderText('Key') as HTMLInputElement[];
    keyInputs[0].focus();
    act(() => {
      ref.current?.triggerDrag?.('h1', 'h2');
    });
    const reordered = getAllByPlaceholderText('Key') as HTMLInputElement[];
    expect(reordered[0].value).toBe('B');
    expect(reordered[1].value).toBe('A');
    expect(document.activeElement).toBe(reordered[1]);
  });
});
