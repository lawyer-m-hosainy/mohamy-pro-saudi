import { describe, it, expect } from 'vitest';
import { camelToSnake, snakeToCamel, toDbRow, fromDbRow } from '../genericCrud';

// genericCrud.ts is the shared persistence layer ~10 stores rely on
// (finance, enforcement, compliance, CLM, IP, advisory, CRM, notifications).
// A silent bug in the camelCase<->snake_case conversion would corrupt
// every one of them, so it gets its own focused coverage.
describe('genericCrud field-name conversion', () => {
  it('converts simple camelCase to snake_case', () => {
    expect(camelToSnake('clientId')).toBe('client_id');
    expect(camelToSnake('amountClaimed')).toBe('amount_claimed');
    expect(camelToSnake('id')).toBe('id');
  });

  it('converts snake_case back to camelCase', () => {
    expect(snakeToCamel('client_id')).toBe('clientId');
    expect(snakeToCamel('amount_claimed')).toBe('amountClaimed');
    expect(snakeToCamel('id')).toBe('id');
  });

  it('round-trips real field names used across the schema', () => {
    const fields = [
      'najizReferenceStatus', 'powerOfAttorneyRef', 'linkedCaseRef',
      'isReconciled', 'winProbability', 'overallProgress', 'isVerified',
    ];
    for (const f of fields) {
      expect(snakeToCamel(camelToSnake(f))).toBe(f);
    }
  });

  it('toDbRow converts every key and drops undefined values', () => {
    const row = toDbRow({ id: '1', clientName: 'Ahmed', amountClaimed: 1000, notes: undefined });
    expect(row).toEqual({ id: '1', client_name: 'Ahmed', amount_claimed: 1000 });
    expect('notes' in row).toBe(false);
  });

  it('fromDbRow converts every key back and preserves jsonb-shaped values untouched', () => {
    const obj = fromDbRow<{ clientName: string; actions: unknown[] }>({
      client_name: 'Ahmed',
      actions: [{ enforcementCaseId: 'x', type: 'تحصيل' }],
    });
    expect(obj.clientName).toBe('Ahmed');
    // Nested jsonb content keeps its own (camelCase) shape — only
    // top-level column names go through conversion.
    expect(obj.actions).toEqual([{ enforcementCaseId: 'x', type: 'تحصيل' }]);
  });

  it('toDbRow/fromDbRow round-trip a full record', () => {
    const original = { id: 'a1', tenantId: 't1', fileNumber: 'ENF-2026-0001', amountCollected: 500 };
    const restored = fromDbRow<typeof original>(toDbRow(original));
    expect(restored).toEqual(original);
  });
});
