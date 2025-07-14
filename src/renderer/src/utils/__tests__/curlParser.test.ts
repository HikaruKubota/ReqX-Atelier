import { describe, it, expect } from 'vitest';
import { parseCurlCommand, isValidCurlCommand, cleanCurlCommand } from '../curlParser';

describe('curlParser', () => {
  describe('isValidCurlCommand', () => {
    it('should return true for valid curl commands', () => {
      expect(isValidCurlCommand('curl https://api.example.com')).toBe(true);
      expect(isValidCurlCommand('curl -X POST https://api.example.com')).toBe(true);
      expect(isValidCurlCommand('curl\thttps://api.example.com')).toBe(true);
    });

    it('should return false for invalid commands', () => {
      expect(isValidCurlCommand('wget https://api.example.com')).toBe(false);
      expect(isValidCurlCommand('https://api.example.com')).toBe(false);
      expect(isValidCurlCommand('')).toBe(false);
    });
  });

  describe('cleanCurlCommand', () => {
    it('should remove shell prompts and normalize whitespace', () => {
      expect(cleanCurlCommand('$ curl https://api.example.com')).toBe(
        'curl https://api.example.com',
      );
      expect(cleanCurlCommand('> curl -X POST \\\n  https://api.example.com')).toBe(
        'curl -X POST https://api.example.com',
      );
      expect(cleanCurlCommand('curl  -X   POST    https://api.example.com')).toBe(
        'curl -X POST https://api.example.com',
      );
    });
  });

  describe('parseCurlCommand', () => {
    it('should parse basic GET request', () => {
      const result = parseCurlCommand('curl https://api.example.com/users');

      expect(result.method).toBe('GET');
      expect(result.url).toBe('https://api.example.com/users');
      expect(result.headers).toHaveLength(0);
      expect(result.body).toHaveLength(0);
      expect(result.params).toHaveLength(0);
    });

    it('should parse POST request with method specified', () => {
      const result = parseCurlCommand('curl -X POST https://api.example.com/users');

      expect(result.method).toBe('POST');
      expect(result.url).toBe('https://api.example.com/users');
    });

    it('should parse headers', () => {
      const result = parseCurlCommand(
        `curl -H 'Content-Type: application/json' -H 'Authorization: Bearer token123' https://api.example.com`,
      );

      expect(result.headers).toHaveLength(2);
      expect(result.headers[0].keyName).toBe('Content-Type');
      expect(result.headers[0].value).toBe('application/json');
      expect(result.headers[0].enabled).toBe(true);
      expect(result.headers[1].keyName).toBe('Authorization');
      expect(result.headers[1].value).toBe('Bearer token123');
    });

    it('should parse JSON data', () => {
      const result = parseCurlCommand(
        `curl -X POST -d '{"name":"John","email":"john@example.com"}' https://api.example.com/users`,
      );

      expect(result.method).toBe('POST');
      expect(result.body).toHaveLength(2);
      expect(result.body[0].keyName).toBe('name');
      expect(result.body[0].value).toBe('John');
      expect(result.body[1].keyName).toBe('email');
      expect(result.body[1].value).toBe('john@example.com');
    });

    it('should parse URL-encoded form data', () => {
      const result = parseCurlCommand(
        `curl -X POST -d 'name=John&email=john@example.com&age=25' https://api.example.com/users`,
      );

      expect(result.method).toBe('POST');
      expect(result.body).toHaveLength(3);
      expect(result.body[0].keyName).toBe('name');
      expect(result.body[0].value).toBe('John');
      expect(result.body[1].keyName).toBe('email');
      expect(result.body[1].value).toBe('john@example.com');
      expect(result.body[2].keyName).toBe('age');
      expect(result.body[2].value).toBe('25');
    });

    it('should parse raw data', () => {
      const result = parseCurlCommand(
        `curl -X POST -d 'raw text data' https://api.example.com/upload`,
      );

      expect(result.method).toBe('POST');
      expect(result.body).toHaveLength(1);
      expect(result.body[0].keyName).toBe('data');
      expect(result.body[0].value).toBe('raw text data');
    });

    it('should parse URL parameters', () => {
      const result = parseCurlCommand(
        'curl https://api.example.com/search?q=test&limit=10&sort=name',
      );

      expect(result.url).toBe('https://api.example.com/search');
      expect(result.params).toHaveLength(3);
      expect(result.params[0].keyName).toBe('q');
      expect(result.params[0].value).toBe('test');
      expect(result.params[1].keyName).toBe('limit');
      expect(result.params[1].value).toBe('10');
      expect(result.params[2].keyName).toBe('sort');
      expect(result.params[2].value).toBe('name');
    });

    it('should handle complex curl command with multiple options', () => {
      const curlCommand = `curl -X POST \\
        -H 'Content-Type: application/json' \\
        -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9' \\
        -d '{"user":{"name":"John Doe","email":"john@example.com","role":"admin"}}' \\
        'https://api.example.com/v1/users?include=profile&format=json'`;

      const result = parseCurlCommand(curlCommand);

      expect(result.method).toBe('POST');
      expect(result.url).toBe('https://api.example.com/v1/users');
      expect(result.headers).toHaveLength(2);
      expect(result.headers[0].keyName).toBe('Content-Type');
      expect(result.headers[1].keyName).toBe('Authorization');
      expect(result.body).toHaveLength(1);
      expect(result.body[0].keyName).toBe('user');
      expect(result.params).toHaveLength(2);
      expect(result.params[0].keyName).toBe('include');
      expect(result.params[0].value).toBe('profile');
      expect(result.params[1].keyName).toBe('format');
      expect(result.params[1].value).toBe('json');
    });

    it('should handle quoted URLs', () => {
      const result = parseCurlCommand(`curl "https://api.example.com/users"`);

      expect(result.url).toBe('https://api.example.com/users');
    });

    it('should handle single quoted URLs', () => {
      const result = parseCurlCommand(`curl 'https://api.example.com/users'`);

      expect(result.url).toBe('https://api.example.com/users');
    });

    it('should default to POST when data is provided without explicit method', () => {
      const result = parseCurlCommand(`curl -d 'test=data' https://api.example.com/submit`);

      expect(result.method).toBe('POST');
    });

    it('should handle --data-raw option', () => {
      const result = parseCurlCommand(`curl --data-raw 'raw data content' https://api.example.com`);

      expect(result.method).toBe('POST');
      expect(result.body).toHaveLength(1);
      expect(result.body[0].value).toBe('raw data content');
    });

    it('should handle --header option', () => {
      const result = parseCurlCommand(
        `curl --header 'Accept: application/json' https://api.example.com`,
      );

      expect(result.headers).toHaveLength(1);
      expect(result.headers[0].keyName).toBe('Accept');
      expect(result.headers[0].value).toBe('application/json');
    });

    it('should handle --request option', () => {
      const result = parseCurlCommand(`curl --request PUT https://api.example.com/users/1`);

      expect(result.method).toBe('PUT');
    });

    it('should handle edge case with malformed JSON gracefully', () => {
      const result = parseCurlCommand(`curl -d '{invalid json}' https://api.example.com`);

      expect(result.body).toHaveLength(1);
      expect(result.body[0].keyName).toBe('data');
      expect(result.body[0].value).toBe('{invalid json}');
    });

    it('should handle empty URL parameters gracefully', () => {
      const result = parseCurlCommand('curl https://api.example.com?');

      expect(result.url).toBe('https://api.example.com');
      expect(result.params).toHaveLength(0);
    });

    it('should generate unique IDs for each key-value pair', () => {
      const result = parseCurlCommand(
        `curl -H 'X-Test: 1' -H 'X-Test: 2' -d 'a=1&a=2' https://api.example.com`,
      );

      const headerIds = result.headers.map((h) => h.id);
      const bodyIds = result.body.map((b) => b.id);

      expect(new Set(headerIds).size).toBe(headerIds.length); // All IDs should be unique
      expect(new Set(bodyIds).size).toBe(bodyIds.length); // All IDs should be unique
    });
  });
});
