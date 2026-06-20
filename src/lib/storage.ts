/**
 * CarbonWise — Typed localStorage Wrapper
 * Safe read/write with JSON parsing, error handling, and key namespacing.
 */

const KEY_PREFIX = 'cw_';

const STORAGE_KEYS = {
  calculatorResult: `${KEY_PREFIX}calculator_result`,
  onboardingData: `${KEY_PREFIX}onboarding_data`,
  userGoals: `${KEY_PREFIX}user_goals`,
  notifications: `${KEY_PREFIX}notifications`,
  isAuthenticated: `${KEY_PREFIX}is_authenticated`,
  userName: `${KEY_PREFIX}user_name`,
  userAvatar: `${KEY_PREFIX}user_avatar`,
  sustainabilityScore: `${KEY_PREFIX}sustainability_score`,
  userCreatedAt: `${KEY_PREFIX}user_created_at`,
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Reads and JSON-parses a value from localStorage.
 * Returns null if key doesn't exist or parsing fails.
 */
export function readStorage<T>(key: StorageKey): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    if (raw === null || raw === undefined) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * JSON-stringifies and writes a value to localStorage.
 * Returns false if write fails (e.g., storage quota exceeded).
 */
export function writeStorage<T>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes an item from localStorage.
 */
export function removeStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } catch {
    // Silently fail
  }
}

/**
 * Clears all CarbonWise keys from localStorage.
 */
export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    // Silently fail
  }
}

export { STORAGE_KEYS };
