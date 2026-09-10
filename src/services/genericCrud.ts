import { supabase } from "@/lib/supabase/client";
import { getCurrentTenantId } from "@/lib/tenant";
import { handleDatabaseError, OperationType } from "@/lib/error";

/**
 * Generic tenant-scoped CRUD, used by every store that doesn't need
 * bespoke handling (encryption, cross-table joins, etc — clients/cases/
 * invoices keep their own hand-written functions in legalDataService.ts
 * for that reason). Most of the ~40 business tables map 1:1 from a
 * camelCase TS field to the identically-named snake_case column
 * (schema.sql was written to guarantee this), so a single conversion
 * pair covers all of them instead of hand-writing ~10 near-identical
 * fetch/save/delete triples.
 *
 * Nested fields (e.g. EnforcementCase.actions, ContractRequest.approvals)
 * are stored as opaque jsonb and round-trip through this unchanged — only
 * the top-level column names need the snake_case conversion.
 */

export function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function toDbRow(obj: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    row[camelToSnake(k)] = v;
  }
  return row;
}

export function fromDbRow<T>(row: Record<string, unknown>): T {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    obj[snakeToCamel(k)] = v;
  }
  return obj as T;
}

export interface TenantCrudOptions {
  /** Table has a deleted_at column and rows should be soft-deleted / filtered instead of hard-deleted. */
  softDelete?: boolean;
  /** Table's primary key is tenant_id itself (e.g. office_settings) rather than a separate id column. */
  tenantIsPrimaryKey?: boolean;
}

export function createTenantCrud<T extends { id?: string; tenantId?: string }>(
  table: string,
  options: TenantCrudOptions = {}
) {
  return {
    async fetchAll(): Promise<T[]> {
      try {
        const tenantId = getCurrentTenantId();
        let query = supabase.from(table).select('*').eq('tenant_id', tenantId);
        if (options.softDelete) query = query.is('deleted_at', null);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((row: Record<string, unknown>) => fromDbRow<T>(row));
      } catch (error) {
        // Matches the existing fetchTrustAccounts/fetchEnforcement/etc.
        // pattern: a failed fetch degrades to an empty list rather than
        // blocking the whole app's bootstrap.
        console.error(`fetch ${table} failed:`, error);
        return [];
      }
    },

    async save(item: T, isUpdate: boolean): Promise<void> {
      try {
        const tenantId = getCurrentTenantId();
        const row = toDbRow({ ...item, tenantId });
        if (isUpdate) {
          if (options.tenantIsPrimaryKey) {
            const { error } = await supabase.from(table).update(row).eq('tenant_id', tenantId);
            if (error) throw error;
          } else {
            const { error } = await supabase.from(table).update(row).eq('id', item.id).eq('tenant_id', tenantId);
            if (error) throw error;
          }
        } else {
          const { error } = await supabase.from(table).insert(row);
          if (error) throw error;
        }
      } catch (error) {
        handleDatabaseError(error, isUpdate ? OperationType.UPDATE : OperationType.CREATE, table);
      }
    },

    async remove(id: string): Promise<void> {
      try {
        const tenantId = getCurrentTenantId();
        if (options.softDelete) {
          const { error } = await supabase
            .from(table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('tenant_id', tenantId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from(table).delete().eq('id', id).eq('tenant_id', tenantId);
          if (error) throw error;
        }
      } catch (error) {
        handleDatabaseError(error, OperationType.DELETE, table);
      }
    },
  };
}
