import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders the correct heading level', () => {
    const { container } = render(<Heading level={3}>title</Heading>);
    const h3 = container.querySelector('h3');
    expect(h3).not.toBeNull();
    expect(h3?.textContent).toBe('title');
  });

  it('defaults to h2 when level is not provided', () => {
    const { container } = render(<Heading>text</Heading>);
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.textContent).toBe('text');
  });
});
