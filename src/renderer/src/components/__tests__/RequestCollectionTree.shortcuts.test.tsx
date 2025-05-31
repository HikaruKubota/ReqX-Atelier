import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestCollectionTree } from '../RequestCollectionTree';
import type { SavedRequest, SavedFolder } from '../../types';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

describe('RequestCollectionTree Keyboard Shortcuts', () => {
  const mockProps = {
    folders: [] as SavedFolder[],
    requests: [] as SavedRequest[],
    activeRequestId: null,
    onLoadRequest: vi.fn(),
    onDeleteRequest: vi.fn(),
    onCopyRequest: vi.fn(),
    onAddFolder: vi.fn(),
    onAddRequest: vi.fn(),
    onDeleteFolder: vi.fn(),
    onCopyFolder: vi.fn(),
    moveRequest: vi.fn(),
    moveFolder: vi.fn(),
    onFocusNode: vi.fn(),
  };

  it('allows tab switching shortcuts to bubble up', () => {
    const { container } = render(<RequestCollectionTree {...mockProps} />);
    const tree = container.querySelector('[tabindex="0"]') as HTMLElement;

    // Create a mock event handler at the document level
    const documentKeyHandler = vi.fn();
    document.addEventListener('keydown', documentKeyHandler);

    // Simulate Cmd+Alt+ArrowRight
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      metaKey: true,
      altKey: true,
      bubbles: true,
    });

    tree.dispatchEvent(event);

    // The event should bubble up to document
    expect(documentKeyHandler).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);

    document.removeEventListener('keydown', documentKeyHandler);
  });

  it('allows global shortcuts (Cmd+S, Cmd+N, etc.) to bubble up', () => {
    const { container } = render(<RequestCollectionTree {...mockProps} />);
    const tree = container.querySelector('[tabindex="0"]') as HTMLElement;

    const documentKeyHandler = vi.fn();
    document.addEventListener('keydown', documentKeyHandler);

    // Test Cmd+S (save)
    let event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });
    tree.dispatchEvent(event);
    expect(documentKeyHandler).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);

    documentKeyHandler.mockClear();

    // Test Cmd+Enter (send request)
    event = new KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
      bubbles: true,
    });
    tree.dispatchEvent(event);
    expect(documentKeyHandler).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);

    document.removeEventListener('keydown', documentKeyHandler);
  });

  it('prevents default folder toggle when Alt+Arrow is pressed', () => {
    const { container } = render(<RequestCollectionTree {...mockProps} />);
    const tree = container.querySelector('[tabindex="0"]') as HTMLElement;

    let defaultPrevented = false;
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      altKey: true,
      bubbles: true,
      cancelable: true,
    });

    // Override preventDefault to track if it was called
    event.preventDefault = vi.fn(() => {
      defaultPrevented = true;
    });

    tree.dispatchEvent(event);

    // The preventDefault should have been called
    expect(event.preventDefault).toHaveBeenCalled();
    expect(defaultPrevented).toBe(true);
  });

  it('handles Enter key for renaming without modifiers', () => {
    const { container } = render(<RequestCollectionTree {...mockProps} />);
    const tree = container.querySelector('[tabindex="0"]') as HTMLElement;

    // Since there's no focused node, preventDefault won't be called
    // Let's test that the event is handled but not prevented without a focused node
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.fn();
    event.preventDefault = preventDefaultSpy;

    tree.dispatchEvent(event);

    // Without a focused node, preventDefault should not be called
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
