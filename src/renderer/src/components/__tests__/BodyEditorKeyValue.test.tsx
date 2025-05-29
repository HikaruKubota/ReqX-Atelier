import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BodyEditorKeyValue } from '../BodyEditorKeyValue';
import type { KeyValuePair, BodyEditorKeyValueRef } from '../../types';
import i18n from '../../i18n';

const initialPairs: KeyValuePair[] = [
  { id: '1', keyName: 'foo', value: '1', enabled: true },
  { id: '2', keyName: 'bar', value: '2', enabled: false },
];

describe('BodyEditorKeyValue', () => {
  it('toggles all rows enabled state', () => {
    const { getByText, getAllByRole } = render(
      <BodyEditorKeyValue method="POST" initialBody={initialPairs} />,
    );

    const checkboxes = getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);

    fireEvent.click(getByText('Enable All'));
    getAllByRole('checkbox').forEach((cb) => expect((cb as HTMLInputElement).checked).toBe(true));

    fireEvent.click(getByText('Disable All'));
    getAllByRole('checkbox').forEach((cb) => expect((cb as HTMLInputElement).checked).toBe(false));
  });

  it('imports json into key value pairs', async () => {
    const ref = createRef<BodyEditorKeyValueRef>();
    const { findAllByPlaceholderText } = render(<BodyEditorKeyValue ref={ref} method="POST" />);
    const json = '{"a":1,"b":"str"}';
    await act(async () => {
      expect(ref.current?.importFromJson(json)).toBe(true);
    });
    const keyInputs = (await findAllByPlaceholderText('Key')) as HTMLElement[];
    expect((keyInputs[0] as HTMLInputElement).value).toBe('a');
    expect((keyInputs[1] as HTMLInputElement).value).toBe('b');
  });

  it('opens import modal with large size', () => {
    const { getByText } = render(<BodyEditorKeyValue method="POST" />);
    fireEvent.click(getByText(i18n.t('import_json')));
    const panel = document.querySelector('.max-w-xl');
    expect(panel).toBeTruthy();
  });

  it('calls onChange when pairs update', () => {
    const handleChange = vi.fn();
    const { getAllByPlaceholderText } = render(
      <BodyEditorKeyValue method="POST" initialBody={initialPairs} onChange={handleChange} />,
    );
    const keyInputs = getAllByPlaceholderText('Key') as HTMLElement[];
    fireEvent.change(keyInputs[0] as HTMLInputElement, { target: { value: 'baz' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('reorders rows via drag and keeps focus', () => {
    const ref = createRef<BodyEditorKeyValueRef>();
    const { getAllByPlaceholderText } = render(
      <BodyEditorKeyValue ref={ref} method="POST" initialBody={initialPairs} />,
    );
    const keyInputs = getAllByPlaceholderText('Key') as HTMLElement[];
    (keyInputs[0] as HTMLInputElement).focus();
    expect(document.activeElement).toBe(keyInputs[0]);
    act(() => {
      ref.current?.triggerDrag?.('1', '2');
    });
    const reordered = getAllByPlaceholderText('Key') as HTMLElement[];
    expect((reordered[0] as HTMLInputElement).value).toBe('bar');
    expect((reordered[1] as HTMLInputElement).value).toBe('foo');
    expect(document.activeElement).toBe(reordered[1]);
  });

  it('shows empty state for methods with body', () => {
    const { getByText, queryByPlaceholderText } = render(<BodyEditorKeyValue method="POST" />);
    // No rows should be present initially
    expect(queryByPlaceholderText('Key')).toBeNull();
    // But add button should be available
    expect(getByText('ボディ行を追加')).toBeInTheDocument();
  });
});
