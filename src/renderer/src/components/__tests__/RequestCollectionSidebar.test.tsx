import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import i18n from '../../i18n';
import { RequestCollectionSidebar } from '../RequestCollectionSidebar';
import type { SavedRequest } from '../../types';
import type { RequestCollectionSidebarRef } from '../RequestCollectionSidebar';

const baseProps = {
  savedRequests: [] as SavedRequest[],
  savedFolders: [],
  activeRequestId: null,
  onLoadRequest: () => {},
  onDeleteRequest: () => {},
  onCopyRequest: () => {},
  onReorderRequests: () => {},
  onMoveRequestToFolder: () => {},
  onAddFolder: () => {},
};

describe('RequestCollectionSidebar', () => {
  it('shows full width when open', () => {
    const { getByTestId, getByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar')).toHaveClass('w-[250px]');
    expect(getByText(i18n.t('collection_title'))).toBeInTheDocument();
  });

  it('collapses when closed', () => {
    const { getByTestId, queryByText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen={false} onToggle={() => {}} />,
    );
    expect(getByTestId('sidebar')).toHaveClass('w-[40px]');
    expect(queryByText(i18n.t('collection_title'))).toBeNull();
  });

  it('fires onToggle when button clicked', () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <RequestCollectionSidebar {...baseProps} isOpen onToggle={fn} />,
    );
    fireEvent.click(getByLabelText('サイドバーを隠す'));
    expect(fn).toHaveBeenCalled();
  });

  it('reorders items via triggerDrag', () => {
    const ref = React.createRef<RequestCollectionSidebarRef>();
    const requests: SavedRequest[] = [
      { id: '1', name: 'First', method: 'GET', url: '' },
      { id: '2', name: 'Second', method: 'GET', url: '' },
    ];
    const Wrapper = () => {
      const [list, setList] = React.useState<SavedRequest[]>(requests);
      return (
        <RequestCollectionSidebar
          ref={ref}
          savedRequests={list}
          savedFolders={[]}
          activeRequestId={null}
          onLoadRequest={() => {}}
          onDeleteRequest={() => {}}
          onCopyRequest={() => {}}
          onReorderRequests={(a, b) => {
            const oldIndex = list.findIndex((r) => r.id === a);
            const newIndex = list.findIndex((r) => r.id === b);
            if (oldIndex === -1 || newIndex === -1) return;
            const updated = [...list];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);
            setList(updated);
          }}
          onMoveRequestToFolder={() => {}}
          onAddFolder={() => {}}
          isOpen
          onToggle={() => {}}
        />
      );
    };
    const { getAllByText } = render(<Wrapper />);
    act(() => {
      ref.current?.triggerDrag?.('1', '2');
    });
    const items = getAllByText(/First|Second/);
    expect(items[0].textContent).toBe('Second');
    expect(items[1].textContent).toBe('First');
  });
});
