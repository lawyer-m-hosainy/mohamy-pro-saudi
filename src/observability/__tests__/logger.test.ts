import { describe, it, expect, vi, afterEach } from 'vitest';
import { logEvent } from '../logger';

// sanitizeContext used to only check top-level keys, so a nested object
// like { user: { email, password } } logged both in the clear
// (P11-observability.md, Critical — a PDPL-relevant PII leak into logs).
describe('logEvent redaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function captureLoggedEntry(level: 'info' | 'warn' | 'error', context: Record<string, unknown>) {
    const spy = vi.spyOn(console, level === 'info' ? 'info' : level).mockImplementation(() => {});
    logEvent(level, { event: 'test_event', context });
    const loggedJson = spy.mock.calls[0][1] as string;
    return JSON.parse(loggedJson);
  }

  it('redacts sensitive keys nested inside an object', () => {
    const entry = captureLoggedEntry('info', {
      user: { email: 'a@b.com', password: 'secret123', name: 'Ahmed' },
    });
    expect(entry.context.user.email).toBe('[REDACTED]');
    expect(entry.context.user.password).toBe('[REDACTED]');
    expect(entry.context.user.name).toBe('Ahmed');
  });

  it('redacts sensitive keys nested inside an array of objects', () => {
    const entry = captureLoggedEntry('warn', {
      clients: [{ nationalId: '1234567890', name: 'Client A' }],
    });
    expect(entry.context.clients[0].nationalId).toBe('[REDACTED]');
    expect(entry.context.clients[0].name).toBe('Client A');
  });

  it('still redacts top-level sensitive keys', () => {
    const entry = captureLoggedEntry('error', { token: 'abc.def.ghi', phone: '+966501234567' });
    expect(entry.context.token).toBe('[REDACTED]');
    expect(entry.context.phone).toBe('[REDACTED]');
  });

  it('leaves non-sensitive nested data untouched', () => {
    const entry = captureLoggedEntry('info', { caseId: 'C-1001', meta: { court: 'المحكمة التجارية' } });
    expect(entry.context.caseId).toBe('C-1001');
    expect(entry.context.meta.court).toBe('المحكمة التجارية');
  });
});
