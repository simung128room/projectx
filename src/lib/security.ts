import type express from 'express';

export const SUPABASE_TEXT_LIMITS: Record<string, number> = {
  name: 120,
  title: 160,
  subtitle: 400,
  description: 5000,
  tag: 80,
  type: 80,
  category: 120,
  categoryId: 160,
  customPageId: 160,
  username: 80,
  fullName: 120,
  displayName: 120,
  bio: 500,
  content: 20000,
  slug: 120,
  status: 40,
  rank: 80,
};

export const isSafeExternalUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
};

export const sanitizeText = (value: unknown, max = 500): string => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/<\/?script\b[^>]*>/gi, '')
    .trim()
    .slice(0, max);
};

export const sanitizeNumber = (value: unknown, min = 0, max = 1_000_000): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
};

export const sanitizeBoolean = (value: unknown): boolean => value === true || value === 'true';

export const sanitizeUrlInput = (value: unknown): string => {
  const cleaned = sanitizeText(value, 2048);
  return cleaned && isSafeExternalUrl(cleaned) ? cleaned : '';
};

export const isSafeSupabaseRowId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{1,160}$/.test(value);

export const requireSafeSupabaseRowId = (res: express.Response, id: unknown): id is string => {
  if (isSafeSupabaseRowId(id)) return true;
  res.status(400).json({ error: 'Invalid Supabase row id' });
  return false;
};

export const pickSanitizedFields = (input: any, allowedFields: string[], urlFields: string[] = []) => {
  const result: Record<string, any> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;

  for (const field of allowedFields) {
    if (!(field in input)) continue;
    const value = input[field];
    if (value === undefined) continue;

    if (urlFields.includes(field)) {
      result[field] = sanitizeUrlInput(value);
    } else if (['price', 'originalPrice', 'stock', 'soldCount', 'balance'].includes(field)) {
      result[field] = sanitizeNumber(value, 0, field === 'balance' ? 10_000_000 : 1_000_000);
    } else if (['isHighlight', 'isPopular', 'isPremium'].includes(field)) {
      result[field] = sanitizeBoolean(value);
    } else if (field === 'stockData') {
      result[field] = Array.isArray(value)
        ? value.slice(0, 100_000).map((item) => sanitizeText(item, 5000)).filter(Boolean)
        : [];
    } else if (field === '_version') {
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0) result[field] = value;
    } else if (typeof value === 'string') {
      result[field] = sanitizeText(value, SUPABASE_TEXT_LIMITS[field] || 500);
    } else if (value === null) {
      result[field] = null;
    }
  }

  return result;
};
