import type { KeyValuePair } from '../types';

export interface ParsedCurlRequest {
  method: string;
  url: string;
  headers: KeyValuePair[];
  body: KeyValuePair[];
  params: KeyValuePair[];
}

/**
 * Parse a cURL command string into request components
 * @param curlCommand - The cURL command string
 * @returns Parsed request components
 */
export function parseCurlCommand(curlCommand: string): ParsedCurlRequest {
  // Remove leading/trailing whitespace and normalize line breaks
  const normalized = curlCommand.trim().replace(/\\\s*\n\s*/g, ' ');

  // Default values
  let method = 'GET';
  let url = '';
  const headers: KeyValuePair[] = [];
  const body: KeyValuePair[] = [];
  const params: KeyValuePair[] = [];

  // Extract URL (look for http/https URLs or quoted URLs at the end)
  // First try to find URLs at the end of the command
  const urlMatch = normalized.match(
    /(?:'([^']*https?:\/\/[^']*)'|"([^"]*https?:\/\/[^"]*)"|(\S*https?:\/\/\S*))(?:\s|$)/,
  );
  if (urlMatch) {
    url = urlMatch[1] || urlMatch[2] || urlMatch[3] || '';
  } else {
    // Fallback: look for any quoted string that could be a URL at the end
    const fallbackMatch = normalized.match(/(?:'([^']*)'|"([^"]*)"|(\S+))(?:\s*$)/);
    if (fallbackMatch) {
      const possibleUrl = fallbackMatch[1] || fallbackMatch[2] || fallbackMatch[3] || '';
      // Only use if it looks like a URL (contains dots or slashes)
      if (possibleUrl.includes('.') || possibleUrl.includes('/')) {
        url = possibleUrl;
      }
    }
  }

  // Extract method from -X or --request
  const methodMatch = normalized.match(/(?:-X|--request)\s+(?:'([^']*)'|"([^"]*)"|([^\s]+))/);
  if (methodMatch) {
    method = (methodMatch[1] || methodMatch[2] || methodMatch[3] || 'GET').toUpperCase();
  }

  // Extract headers from -H or --header
  const headerMatches = normalized.matchAll(/(?:-H|--header)\s+(?:'([^']*)'|"([^"]*)"|([^\s]+))/g);
  for (const match of headerMatches) {
    const headerValue = match[1] || match[2] || match[3] || '';
    const colonIndex = headerValue.indexOf(':');
    if (colonIndex > 0) {
      const key = headerValue.substring(0, colonIndex).trim();
      const value = headerValue.substring(colonIndex + 1).trim();
      headers.push({
        id: `header-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        keyName: key,
        value: value,
        enabled: true,
      });
    }
  }

  // Extract data from -d, --data, --data-raw, --data-binary
  const dataMatches = normalized.matchAll(
    /(?:-d|--data|--data-raw|--data-binary)\s+(?:'([^']*)'|"([^"]*)"|([^\s]+))/g,
  );
  let hasData = false;

  for (const match of dataMatches) {
    hasData = true;
    const dataValue = match[1] || match[2] || match[3] || '';

    // Try to parse as JSON first
    try {
      const jsonData = JSON.parse(dataValue);
      if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
        // Convert JSON object to key-value pairs
        Object.entries(jsonData).forEach(([key, value], index) => {
          body.push({
            id: `body-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
            keyName: key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            enabled: true,
          });
        });
        continue;
      }
    } catch {
      // Not valid JSON, continue with other parsing
    }

    // Try to parse as URL-encoded form data
    if (dataValue.includes('=') && dataValue.includes('&')) {
      try {
        const urlParams = new URLSearchParams(dataValue);
        urlParams.forEach((value, key) => {
          body.push({
            id: `body-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            keyName: key,
            value: value,
            enabled: true,
          });
        });
        continue;
      } catch {
        // Not valid URL-encoded data
      }
    }

    // If can't parse as structured data, add as single raw value
    body.push({
      id: `body-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      keyName: 'data',
      value: dataValue,
      enabled: true,
    });
  }

  // If we found data, set method to POST if not already specified
  if (hasData && !methodMatch) {
    method = 'POST';
  }

  // Extract URL parameters
  if (url.includes('?')) {
    const [baseUrl, queryString] = url.split('?', 2);
    url = baseUrl;

    try {
      const urlParams = new URLSearchParams(queryString);
      urlParams.forEach((value, key) => {
        params.push({
          id: `param-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          keyName: key,
          value: value,
          enabled: true,
        });
      });
    } catch {
      // If parsing fails, keep the original URL
      url = baseUrl + '?' + queryString;
    }
  }

  return {
    method,
    url,
    headers,
    body,
    params,
  };
}

/**
 * Validate if a string looks like a cURL command
 * @param input - Input string to validate
 * @returns True if it looks like a cURL command
 */
export function isValidCurlCommand(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith('curl ') || trimmed.startsWith('curl\t');
}

/**
 * Clean up a cURL command by removing common prefixes and normalizing whitespace
 * @param input - Raw cURL command input
 * @returns Cleaned cURL command
 */
export function cleanCurlCommand(input: string): string {
  return input
    .trim()
    .replace(/^\$\s*/, '') // Remove leading $ prompt
    .replace(/^>\s*/, '') // Remove leading > continuation
    .replace(/\\\s*\n\s*/g, ' ') // Normalize line continuations
    .replace(/\s+/g, ' '); // Normalize whitespace
}
