export interface KeyValuePairLike {
  keyName: string;
  value: string;
  enabled?: boolean;
}

/**
 * Build URL with query parameters using URLSearchParams to ensure proper encoding.
 * Falls back to simple concatenation when URL constructor fails.
 */
export function buildUrlWithParams(baseUrl: string, params: KeyValuePairLike[]): string {
  const activeParams = params.filter((p) => p.enabled !== false && p.keyName.trim() !== '');
  if (activeParams.length === 0) return baseUrl;

  try {
    const url = new URL(baseUrl);
    const searchParams = new URLSearchParams(url.search);
    activeParams.forEach((p) => {
      searchParams.set(p.keyName, p.value);
    });
    url.search = searchParams.toString();
    return url.toString();
  } catch {
    const qs = activeParams
      .map((p) => `${encodeURIComponent(p.keyName)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return baseUrl + (baseUrl.includes('?') ? '&' : '?') + qs;
  }
}
