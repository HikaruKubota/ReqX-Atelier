import { describe, it, expect } from 'vitest';
import { buildUrlWithParams } from '../utils/url';

const sampleParams = [{ keyName: 'filter', value: '{"a":1}', enabled: true }];

describe('buildUrlWithParams', () => {
  it('encodes JSON values correctly', () => {
    const url = buildUrlWithParams('https://example.com/api', sampleParams);
    expect(url).toBe('https://example.com/api?filter=%7B%22a%22%3A1%7D');
  });

  it('appends to existing query string', () => {
    const url = buildUrlWithParams('https://example.com/api?foo=1', sampleParams);
    expect(url).toBe('https://example.com/api?foo=1&filter=%7B%22a%22%3A1%7D');
  });
});
