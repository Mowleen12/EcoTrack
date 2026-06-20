/**
 * Tests for sanitize.ts utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeText,
  validateEmail,
  validatePassword,
  validateDisplayName,
  clampNumber,
  checkRateLimit,
} from '../lib/sanitize';

describe('sanitizeText', () => {
  it('removes HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeText('<b>bold</b>')).not.toContain('<b>');
  });

  it('escapes HTML entities', () => {
    const result = sanitizeText('Hello & "World"');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('enforces maxLength', () => {
    const long = 'a'.repeat(2000);
    expect(sanitizeText(long, 100).length).toBe(100);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null as unknown as string)).toBe('');
    expect(sanitizeText(undefined as unknown as string)).toBe('');
  });

  it('keeps safe text unchanged', () => {
    expect(sanitizeText('Hello world 123')).toBe('Hello world 123');
  });
});

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user+tag@subdomain.example.co.uk')).toBe(true);
    expect(validateEmail('alex@carbonwise.app')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@example')).toBe(false);
  });

  it('rejects emails over 320 characters', () => {
    const long = 'a'.repeat(315) + '@b.com';
    expect(validateEmail(long)).toBe(false);
  });

  it('returns false for non-string input', () => {
    expect(validateEmail(null as unknown as string)).toBe(false);
    expect(validateEmail(123 as unknown as string)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts passwords with 6+ characters', () => {
    expect(validatePassword('password').valid).toBe(true);
    expect(validatePassword('secureP@ss1').valid).toBe(true);
  });

  it('rejects passwords under 6 characters', () => {
    expect(validatePassword('abc').valid).toBe(false);
    expect(validatePassword('12345').valid).toBe(false);
  });

  it('rejects empty password', () => {
    expect(validatePassword('').valid).toBe(false);
  });

  it('rejects passwords over 128 characters', () => {
    const long = 'a'.repeat(129);
    expect(validatePassword(long).valid).toBe(false);
  });

  it('returns error message for invalid passwords', () => {
    const result = validatePassword('abc');
    expect(result.message.length).toBeGreaterThan(0);
  });
});

describe('validateDisplayName', () => {
  it('accepts valid names', () => {
    expect(validateDisplayName('Alex Turner').valid).toBe(true);
    expect(validateDisplayName('Jo').valid).toBe(true);
  });

  it('rejects empty names', () => {
    expect(validateDisplayName('').valid).toBe(false);
    expect(validateDisplayName('   ').valid).toBe(false);
  });

  it('rejects names over 60 characters', () => {
    expect(validateDisplayName('a'.repeat(61)).valid).toBe(false);
  });

  it('rejects names with HTML tags', () => {
    expect(validateDisplayName('<script>alert(1)</script>').valid).toBe(false);
  });

  it('rejects names with URLs', () => {
    expect(validateDisplayName('Visit http://spam.com').valid).toBe(false);
  });
});

describe('clampNumber', () => {
  it('clamps to minimum', () => {
    expect(clampNumber(-10, 0, 100)).toBe(0);
  });

  it('clamps to maximum', () => {
    expect(clampNumber(200, 0, 100)).toBe(100);
  });

  it('leaves value in range unchanged', () => {
    expect(clampNumber(50, 0, 100)).toBe(50);
  });

  it('returns min for NaN', () => {
    expect(clampNumber(NaN, 0, 100)).toBe(0);
  });

  it('returns min for Infinity', () => {
    expect(clampNumber(-Infinity, 0, 100)).toBe(0);
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Each test uses unique key to avoid interference
  });

  it('allows actions under the limit', () => {
    expect(checkRateLimit('test-rl-1', 3, 60000)).toBe(true);
    expect(checkRateLimit('test-rl-1', 3, 60000)).toBe(true);
    expect(checkRateLimit('test-rl-1', 3, 60000)).toBe(true);
  });

  it('blocks actions over the limit', () => {
    checkRateLimit('test-rl-2', 2, 60000);
    checkRateLimit('test-rl-2', 2, 60000);
    expect(checkRateLimit('test-rl-2', 2, 60000)).toBe(false);
  });

  it('independent keys do not interfere', () => {
    checkRateLimit('test-rl-3a', 1, 60000);
    expect(checkRateLimit('test-rl-3b', 1, 60000)).toBe(true);
  });
});
