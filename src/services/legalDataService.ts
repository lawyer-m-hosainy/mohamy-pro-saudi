import { supabase } from "@/lib/supabase/client";
import { Case, Client, Invoice } from "@/types";
import { decryptField, encryptField } from "@/lib/encryption";
import { DEMO_TENANT_ID, getCurrentTenantId } from "@/lib/tenant";
import { mapCaseStatusToStage } from "@/domain/legalWorkflow";
import { handleDatabaseError, OperationType } from "@/lib/error";

const CLIENTS_TABLE = "clients";
const CASES_TABLE = "cases";
const INVOICES_TABLE = "invoices";
const AUDIT_LOGS_TABLE = "audit_logs";

export async function fetchClients(): Promise<Client[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId);
      
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

export async function saveClient(client: Client): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    
    const dbPayload = {
      tenant_id: tenantId,
      name: client.name,
      type: client.type,
      phone: client.phone,
      national_id: client.nationalId ? encryptField(client.nationalId) : null,
      commercial_registration: client.commercialRegistration ? encryptField(client.commercialRegistration) : null,
      vat_number: client.vatNumber ? encryptField(client.vatNumber) : null,
    };

    let error;
    if (client.id) {
      const { error: updateError } = await supabase
        .from(CLIENTS_TABLE)
        .update(dbPayload)
        .eq('id', client.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from(CLIENTS_TABLE)
        .insert(dbPayload);
      error = insertError;
    }

    if (error) throw error;
    await logAuditAction('CREATE/UPDATE', CLIENTS_TABLE, client.id || 'new', `Saved client ${client.name}`);
  } catch (error) {
    handleDatabaseError(error, OperationType.WRITE, CLIENTS_TABLE);
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
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
      
    if (error) throw error;
    
    const cases = data.map((d: any) => ({
      id: d.id,
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
      powerOfAttorneyRef: d.power_of_attorney_ref,
      status: d.status,
      externalPlatformRef: d.external_platform_ref,
      createdAt: d.created_at,
      tenantId: d.tenant_id,
    } as Case));

    const hasMore = count !== null && offset + pageSize < count;
    
    return { data: cases, lastDoc: offset + pageSize, hasMore };
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CASES_TABLE);
  }
}

export async function fetchCases(): Promise<Case[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(CASES_TABLE)
      .select('*')
      .eq('tenant_id', tenantId);
      
    if (error) throw error;
    
    return data.map((d: any) => ({
      id: d.id,
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
      powerOfAttorneyRef: d.power_of_attorney_ref,
      status: d.status,
      externalPlatformRef: d.external_platform_ref,
      createdAt: d.created_at,
      tenantId: d.tenant_id,
    } as Case));
  } catch (error) {
    handleDatabaseError(error, OperationType.LIST, CASES_TABLE);
  }
}

export async function getNextCounter(type: 'circulation' | 'archive'): Promise<string> {
  // A simple fallback if counters are not properly migrated. Ideally handled by a Postgres sequence.
  const random = Math.floor(1000 + Math.random() * 9000);
  return type === 'circulation' ? `T-${random}` : `H-${random}`;
}

export async function saveCases(cases: Case[]): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    const payload = cases.map(c => ({
      id: c.id,
      tenant_id: tenantId,
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
      power_of_attorney_ref: c.powerOfAttorneyRef,
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
  // Basic implementation
  console.log(`Audit: ${action} on ${collectionName}/${documentId} - ${details}`);
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from(INVOICES_TABLE)
      .select('*')
      .eq('tenant_id', tenantId);
      
    if (error) throw error;
    return data.map((d: any) => ({...d, tenantId: d.tenant_id}) as Invoice);
  } catch (error) {
    return [];
  }
}

export async function fetchTrustAccounts(): Promise<any[]> {
  return [];
}

export async function fetchEnforcement(): Promise<any[]> {
  return [];
}

export async function fetchTasks(): Promise<any[]> {
  return [];
}

export async function fetchTeam(): Promise<any[]> {
  return [];
}

export async function saveInvoice(invoice: Invoice, isUpdate: boolean = false): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    const { error } = await supabase.from(INVOICES_TABLE).upsert({ ...invoice, tenant_id: tenantId });
    if (error) throw error;
  } catch (error) {
    handleDatabaseError(error, OperationType.WRITE, INVOICES_TABLE);
  }
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    const { error } = await supabase
      .from(INVOICES_TABLE)
      .delete()
      .eq('id', invoiceId)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  } catch (error) {
    handleDatabaseError(error, OperationType.DELETE, INVOICES_TABLE);
  }
}
