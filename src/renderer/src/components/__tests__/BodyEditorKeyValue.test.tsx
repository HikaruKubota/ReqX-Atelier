import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
      <BodyEditorKeyValue method="POST" initialBodyKeyValuePairs={initialPairs} />,
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
    const keyInputs = (await findAllByPlaceholderText('Key')) as HTMLInputElement[];
    expect(keyInputs[0].value).toBe('a');
    expect(keyInputs[1].value).toBe('b');
  });

  it('opens import modal with large size', () => {
    const { getByText } = render(<BodyEditorKeyValue method="POST" />);
    fireEvent.click(getByText(i18n.t('import_json')));
    const panel = document.querySelector('.max-w-xl');
    expect(panel).toBeTruthy();
  });
});
