import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Case, Client, Invoice } from "@/types";
import { collection, doc, getDocs, query, setDoc, where, deleteDoc } from "firebase/firestore";
import { DEMO_TENANT_ID, getCurrentTenantId } from "@/lib/tenant";
import { mapCaseStatusToStage } from "@/domain/legalWorkflow";

const CLIENTS_COLLECTION = "clients";
const CASES_COLLECTION = "cases";
const INVOICES_COLLECTION = "invoices";
const AUDIT_LOGS_COLLECTION = "audit_logs";

export async function fetchClients(): Promise<Client[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(
      query(collection(db, CLIENTS_COLLECTION), where("tenantId", "==", tenantId))
    );
    return snapshot.docs.map((d) => d.data() as Client);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CLIENTS_COLLECTION);
  }
}

export async function fetchCases(): Promise<Case[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(
      query(collection(db, CASES_COLLECTION), where("tenantId", "==", tenantId))
    );
    return snapshot.docs.map((d) => d.data() as Case);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CASES_COLLECTION);
  }
}

export async function saveCases(cases: Case[]): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    await Promise.all(
      cases.map((c) =>
        setDoc(doc(db, CASES_COLLECTION, c.id), { ...c, tenantId, workflowStage: c.workflowStage || mapCaseStatusToStage(c.status) }, {
          merge: true,
        })
      )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CASES_COLLECTION);
  }
}

export async function logAuditAction(action: string, collectionName: string, documentId: string, details?: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    const logId = `AUDIT-${Date.now()}`;
    await setDoc(doc(db, AUDIT_LOGS_COLLECTION, logId), {
      id: logId,
      userId: 'system',
      userName: 'System',
      action,
      module: collectionName,
      details: details || `${action} on ${documentId}`,
      timestamp: new Date().toISOString(),
      ipAddress: 'server',
    });
  } catch (error) {
    console.error("Audit log failed to write:", error);
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(
      query(collection(db, INVOICES_COLLECTION), where("tenantId", "==", tenantId))
    );
    return snapshot.docs.map((d) => d.data() as Invoice);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, INVOICES_COLLECTION);
    return [];
  }
}

export async function fetchTrustAccounts(): Promise<any[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(query(collection(db, "trustAccounts"), where("tenantId", "==", tenantId)));
    return snapshot.docs.map(d => d.data());
  } catch (error) {
    return [];
  }
}

export async function fetchEnforcement(): Promise<any[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(query(collection(db, "enforcement"), where("tenantId", "==", tenantId)));
    return snapshot.docs.map(d => d.data());
  } catch (error) {
    return [];
  }
}

export async function fetchTasks(): Promise<any[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(query(collection(db, "tasks"), where("tenantId", "==", tenantId)));
    return snapshot.docs.map(d => d.data());
  } catch (error) {
    return [];
  }
}

export async function fetchTeam(): Promise<any[]> {
  try {
    const tenantId = getCurrentTenantId();
    const snapshot = await getDocs(query(collection(db, "team"), where("tenantId", "==", tenantId)));
    return snapshot.docs.map(d => d.data());
  } catch (error) {
    return [];
  }
}

export async function saveInvoice(invoice: Invoice, isUpdate: boolean = false): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    await setDoc(doc(db, INVOICES_COLLECTION, invoice.id), { ...invoice, tenantId }, { merge: true });
    await logAuditAction(isUpdate ? 'UPDATE' : 'CREATE', INVOICES_COLLECTION, invoice.id, `Saved invoice with total ${invoice.total}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, INVOICES_COLLECTION);
  }
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    const tenantId = getCurrentTenantId();
    // Verify the invoice belongs to the current tenant before deleting
    const snapshot = await getDocs(
      query(collection(db, INVOICES_COLLECTION), where("tenantId", "==", tenantId))
    );
    const invoiceExists = snapshot.docs.some((d) => d.id === invoiceId);
    if (!invoiceExists) {
      throw new Error("INVOICE_NOT_FOUND_OR_UNAUTHORIZED");
    }
    await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    await logAuditAction('DELETE', INVOICES_COLLECTION, invoiceId, 'Deleted invoice');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, INVOICES_COLLECTION);
  }
}
