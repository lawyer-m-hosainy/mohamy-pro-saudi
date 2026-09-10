
// A real UUID (not the string "demo-tenant") because schema.sql's tenant_id
// columns are typed uuid — inserting/filtering on a non-uuid string throws
// a Postgres type error and breaks the demo tenant entirely
// (P3-database.md, High).
export const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000000";

/**
 * In-memory cache for the resolved tenantId.
 * Set by AuthProvider after reading the user profile from Supabase, or by
 * the demo-mode login handler (src/views/Login.tsx) to DEMO_TENANT_ID.
 */
let cachedTenantId: string | null = null;

export function setTenantIdCache(tenantId: string | null) {
  cachedTenantId = tenantId;
}

export function getCachedTenantId(): string | null {
  return cachedTenantId;
}

/**
 * Returns the current tenant ID.
 *
 * Fails closed: throws if no tenant has been resolved yet, instead of
 * silently falling back to DEMO_TENANT_ID (P5-rbac-tenancy.md, High —
 * "Silent Fallback / Fail Open"). During the brief window between sign-in
 * and AuthProvider resolving the user's profile, every read/write that
 * needs a tenant should fail loudly (callers already run inside try/catch
 * and surface an error) rather than risk reading or writing into the demo
 * tenant's data by accident. Demo mode is the one legitimate case that
 * reads DEMO_TENANT_ID — it gets there by explicitly caching it, not by
 * this function guessing.
 */
export function getCurrentTenantId(): string {
  if (cachedTenantId) return cachedTenantId;
  throw new Error("لم يتم تحديد هوية المكتب (tenant) بعد. الرجاء إعادة تسجيل الدخول.");
}
