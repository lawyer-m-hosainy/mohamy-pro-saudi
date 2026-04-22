import { Client } from "@/types";

/**
 * Validates that a client has the required identity fields based on type.
 */
export function validateClientIdentity(client: Partial<Client>): { valid: boolean; error?: string } {
  if (!client.name || client.name.trim().length < 2) {
    return { valid: false, error: "اسم العميل مطلوب (حرفان على الأقل)" };
  }
  if (!client.phone) {
    return { valid: false, error: "رقم الجوال مطلوب" };
  }
  if (client.type === "فرد" && !client.nationalId) {
    return { valid: false, error: "رقم الهوية مطلوب للأفراد" };
  }
  if (client.type === "منشأة" && !client.commercialRegistration) {
    return { valid: false, error: "السجل التجاري مطلوب للمنشآت" };
  }
  return { valid: true };
}

/**
 * Validates Saudi National ID format (10 digits starting with 1 or 2).
 */
export function isValidNationalId(id: string): boolean {
  return /^[12]\d{9}$/.test(id);
}

/**
 * Validates Saudi Commercial Registration (10 digits starting with 7).
 */
export function isValidCommercialRegistration(cr: string): boolean {
  return /^7\d{9}$/.test(cr);
}

/**
 * Validates ZATCA VAT number (15 digits starting with 3).
 */
export function isValidVatNumber(vat: string): boolean {
  return /^3\d{14}$/.test(vat);
}

/**
 * Checks if a client can be safely deleted (no active cases linked).
 */
export function canDeleteClient(clientId: string, activeCaseClientIds: string[]): { allowed: boolean; reason?: string } {
  if (activeCaseClientIds.includes(clientId)) {
    return { allowed: false, reason: "لا يمكن حذف عميل لديه قضايا نشطة" };
  }
  return { allowed: true };
}

/**
 * Enriches client display data.
 */
export function getClientDisplayBadge(client: Client): { label: string; color: string } {
  if (client.type === "منشأة") {
    return { label: "منشأة", color: "blue" };
  }
  return { label: "فرد", color: "purple" };
}
