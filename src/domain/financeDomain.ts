import { Invoice, Expense } from "@/types";

const KSA_VAT_RATE = 0.15;

/**
 * Calculates invoice totals with 15% KSA VAT.
 */
export function calculateInvoiceTotals(base: number): { base: number; vat: number; total: number } {
  const vat = Math.round(base * KSA_VAT_RATE * 100) / 100;
  return { base, vat, total: base + vat };
}

/**
 * Generates a sequential invoice number.
 */
export function generateInvoiceNumber(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(4, "0");
  return `INV-${year}-${seq}`;
}

/**
 * Validates that a payment amount is within acceptable range.
 */
export function validatePaymentAmount(amount: number, invoiceTotal: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: "المبلغ يجب أن يكون أكبر من صفر" };
  }
  if (amount > invoiceTotal) {
    return { valid: false, error: "المبلغ يتجاوز إجمالي الفاتورة" };
  }
  return { valid: true };
}

/**
 * Calculates financial summary from invoices and expenses.
 */
export function computeFinancialSummary(invoices: Invoice[], expenses: Expense[]) {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'مدفوعة').reduce((sum, inv) => sum + inv.total, 0);
  const totalUnpaid = invoices.filter(i => i.status === 'غير مدفوعة').reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalPaid - totalExpenses;
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

  return { totalRevenue, totalPaid, totalUnpaid, totalExpenses, netProfit, collectionRate };
}

/**
 * Groups invoices by month for charting.
 */
export function groupInvoicesByMonth(invoices: Invoice[]): { name: string; value: number }[] {
  const grouped: Record<string, number> = {};
  invoices.forEach(inv => {
    const date = new Date(inv.date);
    const month = date.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });
    grouped[month] = (grouped[month] || 0) + inv.total;
  });
  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}
