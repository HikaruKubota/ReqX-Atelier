import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JsonPre } from '../JsonPre';

describe('JsonPre', () => {
  it('renders json stringified data', () => {
    const data = { a: 1, b: 'two' };
    const { container } = render(<JsonPre data={data} />);
    const pre = container.querySelector('pre');
    expect(pre?.textContent).toBe(JSON.stringify(data, null, 2));
  });
});
