import CryptoJS from "crypto-js";

const UNSAFE_DEFAULT_KEY = "default-unsafe-dev-key-123456789";

function readEnvKey(): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.VITE_ENCRYPTION_KEY : undefined;
  const fromVite = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_ENCRYPTION_KEY : undefined;
  return fromProcess || fromVite || undefined;
}

function isProductionEnv(): boolean {
  const viteProd = typeof import.meta !== "undefined" && (import.meta as any).env?.PROD === true;
  const nodeProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  return Boolean(viteProd || nodeProd);
}

function resolveSecretKey(): string {
  const configured = readEnvKey();
  if (configured) return configured;

  // A misconfigured production deployment (missing VITE_ENCRYPTION_KEY) must
  // fail loudly instead of silently "encrypting" client PII with a key that
  // ships in every build and is public knowledge (P2-security.md, High).
  if (isProductionEnv()) {
    throw new Error(
      "VITE_ENCRYPTION_KEY is not set. Refusing to encrypt/decrypt sensitive data with the default development key in production."
    );
  }

  return UNSAFE_DEFAULT_KEY;
}

const SECRET_KEY = resolveSecretKey();

export function encryptField(value: string | undefined | null): string {
  if (!value) return "";
  try {
    return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return "";
  }
}

export function decryptField(encryptedValue: string | undefined | null): string {
  if (!encryptedValue) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // An empty decrypt result means the ciphertext didn't match this key
    // (wrong key, corrupted value, or plaintext was empty to begin with).
    // Returning the raw ciphertext here used to make the UI show an AES
    // blob as if it were the real value — surfacing "" is honest about the
    // failure instead of masquerading as data.
    return originalText;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

/**
 * Deterministic HMAC-SHA256 of a plaintext value, used as a "blind index"
 * so encrypted PII (national_id, commercial_registration, vat_number) can
 * still be searched by exact value without ever storing it in the clear.
 * See schema.sql's *_hash columns and rls-policies.sql.
 */
export function hashForSearch(value: string | undefined | null): string | null {
  if (!value) return null;
  return CryptoJS.HmacSHA256(value.trim(), SECRET_KEY).toString(CryptoJS.enc.Hex);
}
