import { describe, it, expect, afterEach, vi } from 'vitest';
import { encryptField, decryptField, hashForSearch } from '../encryption';

// encryption.ts protects every piece of client PII (national ID, CR
// number, VAT number) and had zero test coverage (P9-04, High) despite
// shipping with an unsafe hardcoded fallback key.
describe('encryption', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('encryptField / decryptField', () => {
    it('round-trips a value', () => {
      const original = '1234567890';
      const encrypted = encryptField(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted.length).toBeGreaterThan(0);
      expect(decryptField(encrypted)).toBe(original);
    });

    it('round-trips Arabic text', () => {
      const original = 'شركة الأفق للتطوير العقاري';
      expect(decryptField(encryptField(original))).toBe(original);
    });

    it('returns an empty string for null/undefined/empty input on both directions', () => {
      expect(encryptField(null)).toBe('');
      expect(encryptField(undefined)).toBe('');
      expect(encryptField('')).toBe('');
      expect(decryptField(null)).toBe('');
      expect(decryptField(undefined)).toBe('');
      expect(decryptField('')).toBe('');
    });

    it('returns an empty string (not the raw ciphertext) when decryption fails', () => {
      // Garbage input that AES.decrypt can't parse as valid ciphertext for
      // this key. The old behavior returned the input back unchanged,
      // which meant a UI field would silently render an AES blob as if it
      // were the real value instead of failing visibly.
      const garbage = 'not-a-valid-ciphertext';
      expect(decryptField(garbage)).toBe('');
    });
  });

  describe('hashForSearch', () => {
    it('is deterministic for the same input', () => {
      expect(hashForSearch('1234567890')).toBe(hashForSearch('1234567890'));
    });

    it('produces different hashes for different inputs', () => {
      expect(hashForSearch('1234567890')).not.toBe(hashForSearch('0987654321'));
    });

    it('trims whitespace before hashing so lookups are consistent', () => {
      expect(hashForSearch('1234567890')).toBe(hashForSearch('  1234567890  '));
    });

    it('returns null for empty/null/undefined input', () => {
      expect(hashForSearch(null)).toBeNull();
      expect(hashForSearch(undefined)).toBeNull();
      expect(hashForSearch('')).toBeNull();
    });
  });

  describe('production key guard', () => {
    it('throws at import time in production when VITE_ENCRYPTION_KEY is not set', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('VITE_ENCRYPTION_KEY', '');
      vi.resetModules();
      await expect(import('../encryption')).rejects.toThrow(/VITE_ENCRYPTION_KEY/);
    });

    it('does not throw in production when VITE_ENCRYPTION_KEY is set', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'a-real-production-key');
      vi.resetModules();
      await expect(import('../encryption')).resolves.toBeDefined();
    });
  });
});
