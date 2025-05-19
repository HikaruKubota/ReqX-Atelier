import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BodyEditorKeyValue } from '../BodyEditorKeyValue';
import type { KeyValuePair, BodyEditorKeyValueRef } from '../../types';
import i18n from '../../i18n';
import * as sortable from '@dnd-kit/sortable';
import type { SortableContextProps } from '@dnd-kit/sortable';

let itemsHistory: unknown[] = [];

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/sortable')>('@dnd-kit/sortable');
  return {
    ...actual,
    SortableContext: ({ items, children, ...rest }: SortableContextProps) => {
      itemsHistory.push(items);
      const SC = (actual as { SortableContext: React.ComponentType<SortableContextProps> })
        .SortableContext;
      return (
        <SC items={items} {...rest} data-testid="sortable-context">
          {children}
        </SC>
      );
    },
  };
});

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({
      onDragEnd,
      children,
    }: {
      onDragEnd: (e: { active: { id: string }; over: { id: string } }) => void;
      children: React.ReactNode;
    }) => (
      <div
        data-testid="dnd"
        onDragEnd={() => onDragEnd({ active: { id: '1' }, over: { id: '2' } })}
      >
        {children}
      </div>
    ),
  };
});

const initialPairs: KeyValuePair[] = [
  { id: '1', keyName: 'foo', value: '1', enabled: true },
  { id: '2', keyName: 'bar', value: '2', enabled: false },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

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

  it('calls onChange when pairs update', () => {
    const handleChange = vi.fn();
    const { getAllByPlaceholderText } = render(
      <BodyEditorKeyValue method="POST" initialBody={initialPairs} onChange={handleChange} />,
    );
    const keyInputs = getAllByPlaceholderText('Key') as HTMLInputElement[];
    fireEvent.change(keyInputs[0], { target: { value: 'baz' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows drag handle and calls arrayMove on drag end', () => {
    const spy = vi.spyOn(sortable, 'arrayMove');
    const { getAllByLabelText, getByTestId } = render(
      <BodyEditorKeyValue method="POST" initialBody={initialPairs} />,
    );
    const handles = getAllByLabelText(i18n.t('drag_handle'));
    expect(handles.length).toBe(2);

    const dnd = getByTestId('dnd');
    fireEvent.dragEnd(dnd, { detail: { active: { id: '1' }, over: { id: '2' } } });

    expect(spy).toHaveBeenCalled();
  });

  it('does not rerender SortableContext on field edit', async () => {
    itemsHistory = [];
    const { getAllByPlaceholderText, getByTestId } = render(
      <BodyEditorKeyValue method="POST" initialBody={initialPairs} />,
    );
    // wait for initial effect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const keyInputs = getAllByPlaceholderText('Key') as HTMLInputElement[];
    const initialItemsRef = itemsHistory[itemsHistory.length - 1];
    fireEvent.change(keyInputs[0], { target: { value: 'baz' } });

    expect(itemsHistory[itemsHistory.length - 1]).toBe(initialItemsRef);
    const lengthAfterEdit = itemsHistory.length;

    const dnd = getByTestId('dnd');
    fireEvent.dragEnd(dnd, { detail: { active: { id: '1' }, over: { id: '2' } } });

    expect(itemsHistory.length).toBe(lengthAfterEdit + 1);
    expect(itemsHistory[itemsHistory.length - 1]).not.toBe(initialItemsRef);
  });
});
