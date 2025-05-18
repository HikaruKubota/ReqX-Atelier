import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BodyEditorKeyValue, KeyValuePair } from '../BodyEditorKeyValue';

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
    getAllByRole('checkbox').forEach(cb => expect((cb as HTMLInputElement).checked).toBe(true));

    fireEvent.click(getByText('Disable All'));
    getAllByRole('checkbox').forEach(cb => expect((cb as HTMLInputElement).checked).toBe(false));
  });
});
