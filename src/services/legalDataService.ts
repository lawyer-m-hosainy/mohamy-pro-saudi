import { supabase } from "@/lib/supabase/client";
import { Case, Client, Invoice, TeamMember, OfficeSettings } from "@/types";
import { decryptField, encryptField, hashForSearch } from "@/lib/encryption";
import { getCurrentTenantId } from "@/lib/tenant";
import { mapCaseStatusToStage } from "@/domain/legalWorkflow";
import { handleDatabaseError, OperationType } from "@/lib/error";

const CLIENTS_TABLE = "clients";
const CASES_TABLE = "cases";
const INVOICES_TABLE = "invoices";
const AUDIT_LOGS_TABLE = "audit_logs";
const USERS_TABLE = "users";

export async function fetchClients(): Promise<Client[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      phone: d.phone,
      tenantId: d.tenant_id,
      nationalId: d.national_id ? decryptField(d.national_id) : undefined,
      commercialRegistration: d.commercial_registration ? decryptField(d.commercial_registration) : undefined,
      vatNumber: d.vat_number ? decryptField(d.vat_number) : undefined,
    } as Client));
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CLIENTS_TABLE);
  }
}

/**
 * Finds a client by an exact national ID / commercial registration / VAT
 * number without ever decrypting the whole table. These fields are stored
 * AES-encrypted (non-deterministic), so a plain `.eq('national_id', ...)`
 * can never match — the deterministic HMAC in `*_hash` columns is the only
 * thing that can be searched directly (P3-database.md, High).
 */
export async function findClientByIdentifier(identifier: string): Promise<Client | null> {
  try {
    const tenantId = getCurrentTenantId();
    const hash = hashForSearch(identifier);
    if (!hash) return null;

    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .or(`national_id_hash.eq.${hash},commercial_registration_hash.eq.${hash},vat_number_hash.eq.${hash}`)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      phone: data.phone,
      tenantId: data.tenant_id,
      nationalId: data.national_id ? decryptField(data.national_id) : undefined,
      commercialRegistration: data.commercial_registration ? decryptField(data.commercial_registration) : undefined,
      vatNumber: data.vat_number ? decryptField(data.vat_number) : undefined,
    } as Client;
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CLIENTS_TABLE);
    return null;
  }
}

// isUpdate must be passed explicitly (matching saveInvoice's signature) —
// branching on `client.id` being truthy used to decide insert vs. update,
// but callers now always generate a real uuid client-side before calling
// this (crypto.randomUUID()), so a brand-new client would always have a
// truthy id and silently hit the UPDATE branch, matching zero rows and
// never actually creating the client.
export async function saveClient(client: Client, isUpdate: boolean = false): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();

    const dbPayload: Record<string, unknown> = {
      tenant_id: tenantId,
      name: client.name,
      type: client.type,
      phone: client.phone,
      national_id: client.nationalId ? encryptField(client.nationalId) : null,
      commercial_registration: client.commercialRegistration ? encryptField(client.commercialRegistration) : null,
      vat_number: client.vatNumber ? encryptField(client.vatNumber) : null,
      national_id_hash: hashForSearch(client.nationalId),
      commercial_registration_hash: hashForSearch(client.commercialRegistration),
      vat_number_hash: hashForSearch(client.vatNumber),
    };

    let error;
    if (isUpdate) {
      const { error: updateError } = await supabase
        .from(CLIENTS_TABLE)
        .update(dbPayload)
        .eq('id', client.id)
        .eq('tenant_id', tenantId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from(CLIENTS_TABLE)
        .insert({ ...dbPayload, id: client.id });
      error = insertError;
    }

    if (error) throw error;
    await logAuditAction(isUpdate ? 'UPDATE' : 'CREATE', CLIENTS_TABLE, client.id || 'new', `Saved client ${client.name}`);
  } catch (error) {
    handleDatabaseError(error, OperationType.WRITE, CLIENTS_TABLE);
  }
}

/** Soft delete: legal/financial records are never hard-deleted (P16-dr-bcp.md, Medium). */
export async function deleteClient(clientId: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase
      .from(CLIENTS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', clientId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
    await logAuditAction('DELETE', CLIENTS_TABLE, clientId, 'Soft-deleted client');
  } catch (error) {
    handleDatabaseError(error, OperationType.DELETE, CLIENTS_TABLE);
  }
}

const DEFAULT_PAGE_SIZE = 50;

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: number | null; // Using offset for supabase instead of lastDoc snapshot
  hasMore: boolean;
}

export async function fetchClientsPaginated(
  pageSize: number = DEFAULT_PAGE_SIZE,
  offset: number = 0
): Promise<PaginatedResult<Client>> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error, count } = await supabase
      .from(CLIENTS_TABLE)
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const clients = data.map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      phone: d.phone,
      tenantId: d.tenant_id,
      nationalId: d.national_id ? decryptField(d.national_id) : undefined,
      commercialRegistration: d.commercial_registration ? decryptField(d.commercial_registration) : undefined,
      vatNumber: d.vat_number ? decryptField(d.vat_number) : undefined,
    } as Client));

    const hasMore = count !== null && offset + pageSize < count;

    return { data: clients, lastDoc: offset + pageSize, hasMore };
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CLIENTS_TABLE);
  }
}

export async function fetchCasesPaginated(
  pageSize: number = DEFAULT_PAGE_SIZE,
  offset: number = 0
): Promise<PaginatedResult<Case>> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error, count } = await supabase
      .from(CASES_TABLE)
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const cases = data.map(mapCaseRow);

    const hasMore = count !== null && offset + pageSize < count;

    return { data: cases, lastDoc: offset + pageSize, hasMore };
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CASES_TABLE);
  }
}

function mapCaseRow(d: any): Case {
  return {
    id: d.id,
    caseReference: d.case_reference ?? undefined,
    clientId: d.client_id,
    clientRole: d.client_role,
    workflowStage: d.workflow_stage,
    court: d.court,
    circuit: d.circuit,
    title: d.title,
    automatedNumber: d.automated_number,
    circulationCode: d.circulation_code,
    archiveCode: d.archive_code,
    type: d.type,
    plaintiff: d.plaintiff,
    defendant: d.defendant,
    memorandums: d.memorandums || [],
    powerOfAttorneyRef: d.power_of_attorney_ref,
    najizReferenceStatus: d.najiz_reference_status ?? undefined,
    status: d.status,
    externalPlatformRef: d.external_platform_ref,
    createdAt: d.created_at,
    tenantId: d.tenant_id,
  } as Case;
}

export async function fetchCases(): Promise<Case[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(CASES_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (error) throw error;

    return data.map(mapCaseRow);
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CASES_TABLE);
  }
}

/** Soft delete (server.ts's DELETE /api/cases/:id also does this — see there for the API path). */
export async function deleteCase(caseId: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase
      .from(CASES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', caseId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
    await logAuditAction('DELETE', CASES_TABLE, caseId, 'Soft-deleted case');
  } catch (error) {
    handleDatabaseError(error, OperationType.DELETE, CASES_TABLE);
  }
}

export async function getNextCounter(type: 'circulation' | 'archive'): Promise<string> {
  // A simple fallback if counters are not properly migrated. Ideally handled by a Postgres sequence.
  const random = Math.floor(1000 + Math.random() * 9000);
  return type === 'circulation' ? `T-${random}` : `H-${random}`;
}

export async function saveCases(cases: Case[]): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const payload = cases.map(c => ({
      id: c.id,
      tenant_id: tenantId,
      case_reference: c.caseReference ?? null,
      client_id: c.clientId,
      client_role: c.clientRole,
      workflow_stage: c.workflowStage || mapCaseStatusToStage(c.status),
      court: c.court,
      circuit: c.circuit,
      title: c.title,
      automated_number: c.automatedNumber,
      circulation_code: c.circulationCode,
      archive_code: c.archiveCode,
      type: c.type,
      plaintiff: c.plaintiff,
      defendant: c.defendant,
      memorandums: c.memorandums || [],
      power_of_attorney_ref: c.powerOfAttorneyRef,
      najiz_reference_status: c.najizReferenceStatus ?? null,
      status: c.status,
      external_platform_ref: c.externalPlatformRef,
    }));

    const { error } = await supabase.from(CASES_TABLE).upsert(payload);
    if (error) throw error;
  } catch (error) {
    handleDatabaseError(error, OperationType.WRITE, CASES_TABLE);
  }
}

export async function logAuditAction(action: string, collectionName: string, documentId: string, details?: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from(AUDIT_LOGS_TABLE).insert({
      tenant_id: tenantId,
      user_id: user?.id ?? null,
      user_name: user?.email ?? 'system',
      action,
      module: collectionName,
      details: `${documentId}${details ? ` - ${details}` : ''}`,
    });
    // Audit logging must never block the primary operation it's attached to.
    if (error) console.error("Audit log write failed:", error);
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(INVOICES_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      tenantId: d.tenant_id,
      invoiceNumber: d.invoice_number,
      clientId: d.client_id,
      clientName: d.client_name,
      base: d.base,
      vat: d.vat,
      total: d.total,
      status: d.status,
      date: d.date,
    } as Invoice));
  } catch (error) {
    return [];
  }
}

export async function fetchTeam(): Promise<TeamMember[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role,
      avatar: d.avatar_url ?? undefined,
      activeCases: d.active_cases ?? 0,
      pendingTasks: d.pending_tasks ?? 0,
      completedTasks: d.completed_tasks ?? 0,
      joinDate: d.join_date,
      status: d.status ?? 'نشط',
    } as TeamMember));
  } catch (error) {
    console.error("fetchTeam failed:", error);
    return [];
  }
}

/**
 * Adding a team member here creates a "users" row with no auth_id — they
 * can't sign in yet (that requires a real Supabase Auth account, created
 * separately). This is an invited/placeholder record usable for case and
 * task assignment until they complete their own signup and their auth_id
 * gets linked, matching how PortalManagement.tsx handles client-portal
 * accounts the same way.
 */
export async function saveTeamMember(member: TeamMember, isUpdate: boolean = false): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const dbPayload = {
      id: member.id,
      tenant_id: tenantId,
      name: member.name,
      email: member.email,
      role: member.role,
      avatar_url: member.avatar || null,
      active_cases: member.activeCases ?? 0,
      pending_tasks: member.pendingTasks ?? 0,
      completed_tasks: member.completedTasks ?? 0,
      join_date: member.joinDate,
      status: member.status ?? 'نشط',
    };

    let error;
    if (isUpdate) {
      const { error: updateError } = await supabase
        .from(USERS_TABLE)
        .update(dbPayload)
        .eq('id', member.id)
        .eq('tenant_id', tenantId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from(USERS_TABLE).insert(dbPayload);
      error = insertError;
    }
    if (error) throw error;
  } catch (error) {
    handleDatabaseError(error, isUpdate ? OperationType.UPDATE : OperationType.CREATE, USERS_TABLE);
  }
}

/** Soft delete: keeps historical case/task assignment records intact. */
export async function deleteTeamMember(memberId: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase
      .from(USERS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  } catch (error) {
    handleDatabaseError(error, OperationType.DELETE, USERS_TABLE);
  }
}

export async function saveInvoice(invoice: Invoice, isUpdate: boolean = false): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase.from(INVOICES_TABLE).upsert({
      id: invoice.id,
      tenant_id: tenantId,
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
      client_name: invoice.clientName,
      base: invoice.base,
      vat: invoice.vat,
      total: invoice.total,
      status: invoice.status,
      date: invoice.date,
    });
    if (error) throw error;
    await logAuditAction(isUpdate ? 'UPDATE' : 'CREATE', INVOICES_TABLE, invoice.id, `Invoice for ${invoice.clientName}`);
  } catch (error) {
    handleDatabaseError(error, OperationType.WRITE, INVOICES_TABLE);
  }
}

/** Soft delete: invoices are financial/ZATCA records and must be retained. */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase
      .from(INVOICES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
    await logAuditAction('DELETE', INVOICES_TABLE, invoiceId, 'Soft-deleted invoice');
  } catch (error) {
    handleDatabaseError(error, OperationType.DELETE, INVOICES_TABLE);
  }
}

const OFFICE_SETTINGS_TABLE = "office_settings";

export async function fetchOfficeSettings(): Promise<OfficeSettings | null> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(OFFICE_SETTINGS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      name: data.name,
      vatNumber: data.vat_number ?? "",
      address: data.address ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      logo: data.logo ?? "",
    };
  } catch (error) {
    console.error("fetchOfficeSettings failed:", error);
    return null;
  }
}

/** office_settings has tenant_id as its primary key (one row per tenant), so this is always an upsert. */
export async function saveOfficeSettings(settings: OfficeSettings): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase.from(OFFICE_SETTINGS_TABLE).upsert({
      tenant_id: tenantId,
      name: settings.name,
      vat_number: settings.vatNumber,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      logo: settings.logo,
    });
    if (error) throw error;
  } catch (error) {
    handleDatabaseError(error, OperationType.WRITE, OFFICE_SETTINGS_TABLE);
  }
}
