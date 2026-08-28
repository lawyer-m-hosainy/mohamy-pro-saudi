type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  event: string;
  requestId?: string;
  context?: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERN = /(token|password|secret|email|phone|nationalId|vat|commercialRegistration|nationalid|commercialregistration)/i;
const MAX_DEPTH = 6;

/**
 * Recursively redacts sensitive keys at any depth. The previous version
 * only checked top-level keys, so `{ user: { email, password } }` logged
 * both in the clear (P11-observability.md, Critical).
 */
function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return "[TRUNCATED]";

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : sanitizeValue(v, depth + 1);
    }
    return sanitized;
  }

  return value;
}

function sanitizeContext(context?: Record<string, unknown>) {
  if (!context) return undefined;
  return sanitizeValue(context, 0) as Record<string, unknown>;
}

export function logEvent(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    event: payload.event,
    requestId: payload.requestId,
    context: sanitizeContext(payload.context),
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error("[OBS]", JSON.stringify(entry));
    return;
  }
  if (level === "warn") {
    console.warn("[OBS]", JSON.stringify(entry));
    return;
  }
  console.info("[OBS]", JSON.stringify(entry));
}
