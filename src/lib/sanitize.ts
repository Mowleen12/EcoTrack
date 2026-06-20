/**
 * CarbonWise — Sanitization & Validation Utilities
 * Prevents XSS, injection attacks, and invalid form submissions.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Strips HTML tags and escapes entities to prevent XSS.
 * @param input Raw user input
 * @param maxLength Optional max character limit (default 1000)
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  // Remove HTML tags
  const stripped = input.replace(/<[^>]*>/g, '');
  // Escape remaining HTML entities
  const escaped = stripped.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] ?? char);
  // Trim whitespace and enforce length
  return escaped.trim().slice(0, maxLength);
}

/**
 * Validates email address using RFC-5321 compliant regex.
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 320) return false;
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates password meets minimum security requirements.
 * Requires: min 6 characters.
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (typeof password !== 'string') return { valid: false, message: 'Password is required.' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters.' };
  if (password.length > 128) return { valid: false, message: 'Password is too long.' };
  return { valid: true, message: '' };
}

/**
 * Validates a display name (no HTML, no URLs, reasonable length).
 */
export function validateDisplayName(name: string): { valid: boolean; message: string } {
  if (typeof name !== 'string') return { valid: false, message: 'Name is required.' };
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, message: 'Name cannot be empty.' };
  if (trimmed.length > 60) return { valid: false, message: 'Name must be under 60 characters.' };
  // Reject anything that looks like HTML or a URL
  if (/<|>|http|www\./i.test(trimmed)) return { valid: false, message: 'Name contains invalid characters.' };
  return { valid: true, message: '' };
}

/**
 * Clamps a numeric value to a safe range.
 */
export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Rate limiter — returns true if action is allowed.
 * Tracks timestamps for a given key in memory.
 */
const rateLimitMap: Map<string, number[]> = new Map();

export function checkRateLimit(key: string, maxActions: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxActions) return false;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}
