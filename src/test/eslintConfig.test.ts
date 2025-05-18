import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import config from '../../eslint.config.js';

describe('eslint configuration', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });
});
