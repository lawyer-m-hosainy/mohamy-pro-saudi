import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentTenantId, getCachedTenantId, setTenantIdCache, DEMO_TENANT_ID } from '../tenant';

// getCurrentTenantId() is the single choke point every tenant-scoped
// Supabase query goes through (legalDataService.ts, fileService.ts). It
// used to silently fall back to DEMO_TENANT_ID whenever no tenant was
// resolved yet — e.g. the window between sign-in and AuthProvider loading
// the profile — risking reads/writes into the shared demo tenant's data
// (P5-rbac-tenancy.md, High: "Silent Fallback / Fail Open"). It must fail
// closed instead.
describe('tenant', () => {
  beforeEach(() => {
    setTenantIdCache(null);
  });

  it('throws when no tenant has been resolved yet, instead of guessing demo-tenant', () => {
    expect(() => getCurrentTenantId()).toThrow();
  });

  it('returns the cached tenant id once one has been set', () => {
    setTenantIdCache('11111111-1111-1111-1111-111111111111');
    expect(getCurrentTenantId()).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('only returns DEMO_TENANT_ID when it was explicitly cached (demo login), never as a guess', () => {
    setTenantIdCache(DEMO_TENANT_ID);
    expect(getCurrentTenantId()).toBe(DEMO_TENANT_ID);
  });

  it('DEMO_TENANT_ID is a real UUID, not the old "demo-tenant" string', () => {
    // schema.sql's tenant_id columns are `uuid` — a non-uuid string here
    // makes every demo-mode insert/filter throw a Postgres type error.
    expect(DEMO_TENANT_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('getCachedTenantId reflects the cache without throwing', () => {
    expect(getCachedTenantId()).toBeNull();
    setTenantIdCache('11111111-1111-1111-1111-111111111111');
    expect(getCachedTenantId()).toBe('11111111-1111-1111-1111-111111111111');
  });
});
