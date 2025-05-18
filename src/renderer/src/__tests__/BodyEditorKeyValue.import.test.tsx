import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { BodyEditorKeyValue } from '../components/BodyEditorKeyValue';

// This test ensures JSON import populates key/value fields

describe('BodyEditorKeyValue import', () => {
  it('imports JSON and creates rows', async () => {
    render(<BodyEditorKeyValue method="POST" />);

    await userEvent.click(screen.getByText('Import JSON'));
    const textarea = screen.getByPlaceholderText('{"key":"value"}');
    await userEvent.type(textarea, '{"foo": 1, "bar": "baz"}');
    await userEvent.click(screen.getByText('Done'));

    const keyInputs = screen.getAllByPlaceholderText('Key');
    const valueInputs = screen.getAllByPlaceholderText('Value (JSON or string)');
    expect(keyInputs[0]).toHaveValue('foo');
    expect(valueInputs[0]).toHaveValue('1');
    expect(keyInputs[1]).toHaveValue('bar');
    expect(valueInputs[1]).toHaveValue('"baz"');
  });
});
