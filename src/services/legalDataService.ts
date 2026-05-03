import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Case, Client, Invoice } from "@/types";
import { decryptField, encryptField } from "@/lib/encryption";
import { collection, doc, getDocs, query, setDoc, where, deleteDoc, limit, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, runTransaction } from "firebase/firestore";
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
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        nationalId: data.nationalId ? decryptField(data.nationalId) : undefined,
        commercialRegistration: data.commercialRegistration ? decryptField(data.commercialRegistration) : undefined,
        vatNumber: data.vatNumber ? decryptField(data.vatNumber) : undefined,
      } as Client;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CLIENTS_COLLECTION);
  }
}

export async function saveClient(client: Client): Promise<void> {
  try {
    const tenantId = getCurrentTenantId() || DEMO_TENANT_ID;
    
    // Encrypt sensitive fields
    const encryptedClient = {
      ...client,
      nationalId: client.nationalId ? encryptField(client.nationalId) : undefined,
      commercialRegistration: client.commercialRegistration ? encryptField(client.commercialRegistration) : undefined,
      vatNumber: client.vatNumber ? encryptField(client.vatNumber) : undefined,
      tenantId
    };

    await setDoc(doc(db, CLIENTS_COLLECTION, client.id), encryptedClient, { merge: true });
    await logAuditAction('CREATE/UPDATE', CLIENTS_COLLECTION, client.id, `Saved client ${client.name}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLIENTS_COLLECTION);
  }
}

const DEFAULT_PAGE_SIZE = 50;

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function fetchClientsPaginated(
  pageSize: number = DEFAULT_PAGE_SIZE,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<PaginatedResult<Client>> {
  try {
    const tenantId = getCurrentTenantId();
    let q = query(
      collection(db, CLIENTS_COLLECTION),
      where("tenantId", "==", tenantId),
      orderBy("name"),
      limit(pageSize + 1)
    );
    if (lastDoc) {
      q = query(
        collection(db, CLIENTS_COLLECTION),
        where("tenantId", "==", tenantId),
        orderBy("name"),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }
    const snapshot = await getDocs(q);
    const hasMore = snapshot.docs.length > pageSize;
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
    const data = docs.map((d) => {
      const raw = d.data();
      return {
        ...raw,
        nationalId: raw.nationalId ? decryptField(raw.nationalId) : undefined,
        commercialRegistration: raw.commercialRegistration ? decryptField(raw.commercialRegistration) : undefined,
        vatNumber: raw.vatNumber ? decryptField(raw.vatNumber) : undefined,
      } as Client;
    });
    return { data, lastDoc: docs[docs.length - 1] ?? null, hasMore };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CLIENTS_COLLECTION);
  }
}

export async function fetchCasesPaginated(
  pageSize: number = DEFAULT_PAGE_SIZE,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<PaginatedResult<Case>> {
  try {
    const tenantId = getCurrentTenantId();
    let q = query(
      collection(db, CASES_COLLECTION),
      where("tenantId", "==", tenantId),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1)
    );
    if (lastDoc) {
      q = query(
        collection(db, CASES_COLLECTION),
        where("tenantId", "==", tenantId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }
    const snapshot = await getDocs(q);
    const hasMore = snapshot.docs.length > pageSize;
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
    return { data: docs.map(d => d.data() as Case), lastDoc: docs[docs.length - 1] ?? null, hasMore };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CASES_COLLECTION);
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

export async function getNextCounter(type: 'circulation' | 'archive'): Promise<string> {
  const counterRef = doc(db, "counters", type);
  try {
    const newCount = await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(counterRef);
      if (!sfDoc.exists()) {
        transaction.set(counterRef, { last_value: 1 });
        return 1;
      }
      const newCount = (sfDoc.data().last_value || 0) + 1;
      transaction.update(counterRef, { last_value: newCount });
      return newCount;
    });
    
    const prefix = type === 'circulation' ? 'T-' : 'H-';
    return `${prefix}${newCount.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error("Counter transaction failed: ", error);
    const random = Math.floor(1000 + Math.random() * 9000);
    return type === 'circulation' ? `T-${random}` : `H-${random}`;
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
