import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeadersEditor } from '../HeadersEditor';
import type { RequestHeader } from '../../types';
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
        onDragEnd={() => onDragEnd({ active: { id: 'h1' }, over: { id: 'h2' } })}
      >
        {children}
      </div>
    ),
  };
});

describe('HeadersEditor', () => {
  const headers: RequestHeader[] = [
    { id: 'h1', key: '', value: '', enabled: true },
    { id: 'h2', key: '', value: '', enabled: true },
  ];

  it('calls update and remove handlers', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onReorder = vi.fn();
    const { getAllByPlaceholderText, getByText, getAllByLabelText } = render(
      <HeadersEditor
        headers={headers}
        onAddHeader={onAdd}
        onUpdateHeader={onUpdate}
        onRemoveHeader={onRemove}
        onReorderHeaders={onReorder}
      />,
    );

    fireEvent.change(getAllByPlaceholderText('Key')[0], { target: { value: 'A' } });
    expect(onUpdate).toHaveBeenCalledWith('h1', 'key', 'A');

    fireEvent.click(getAllByLabelText('削除')[0]);
    expect(onRemove).toHaveBeenCalledWith('h1');

    fireEvent.click(getByText(i18n.t('add_header')));
    expect(onAdd).toHaveBeenCalled();
  });

  it('handles drag end', () => {
    const spy = vi.spyOn(sortable, 'arrayMove');
    const onReorder = vi.fn();
    const { getAllByLabelText, getByTestId } = render(
      <HeadersEditor
        headers={headers}
        onAddHeader={vi.fn()}
        onUpdateHeader={vi.fn()}
        onRemoveHeader={vi.fn()}
        onReorderHeaders={onReorder}
      />,
    );
    const handles = getAllByLabelText(i18n.t('drag_handle'));
    expect(handles.length).toBe(2);

    const dnd = getByTestId('dnd');
    fireEvent.dragEnd(dnd, { detail: { active: { id: 'h1' }, over: { id: 'h2' } } });

    expect(spy).toHaveBeenCalled();
    expect(onReorder).toHaveBeenCalled();
  });

  it('does not rerender SortableContext on header edit', async () => {
    itemsHistory = [];
    const Wrapper: React.FC = () => {
      const [hs, setHs] = React.useState(headers);
      return (
        <HeadersEditor
          headers={hs}
          onAddHeader={vi.fn()}
          onUpdateHeader={vi.fn()}
          onRemoveHeader={vi.fn()}
          onReorderHeaders={setHs}
        />
      );
    };

    const { getAllByPlaceholderText, getByTestId } = render(<Wrapper />);
    // wait for initial effect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const inputs = getAllByPlaceholderText('Key') as HTMLInputElement[];
    const initialItemsRef = itemsHistory[itemsHistory.length - 1];
    fireEvent.change(inputs[0], { target: { value: 'X' } });

    expect(itemsHistory[itemsHistory.length - 1]).toBe(initialItemsRef);
    const lengthAfterEdit = itemsHistory.length;

    const dnd = getByTestId('dnd');
    fireEvent.dragEnd(dnd, { detail: { active: { id: 'h1' }, over: { id: 'h2' } } });

    expect(itemsHistory.length).toBe(lengthAfterEdit + 1);
    expect(itemsHistory[itemsHistory.length - 1]).not.toBe(initialItemsRef);
  });
});
