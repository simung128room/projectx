const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export const safeExternalUrl = (value: unknown, fallback = '#'): string => {
  if (typeof value !== 'string' || value.length > 2048) return fallback;
  try {
    const parsed = new URL(value, globalThis.location?.origin || 'https://example.invalid');
    if (!SAFE_PROTOCOLS.has(parsed.protocol)) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
};

export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
