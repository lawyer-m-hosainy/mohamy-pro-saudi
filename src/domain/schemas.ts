import { z } from 'zod';

// Client Schema
export const ClientSchema = z.object({
  id: z.string(),
  type: z.enum(['فرد', 'منشأة']),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  nationalId: z.string().optional(),
  commercialRegistration: z.string().optional(),
  vatNumber: z.string().optional(),
  // Saudi phone format validation : +9665XXXXXXXX
  phone: z.string().regex(/^\+9665[0-9]{8}$/, "رقم الجوال يجب أن يكون بالصيغة السعودية +9665XXXXXXXX"),
});

export type ClientValidationData = z.infer<typeof ClientSchema>;

// Case Schema
export const CaseSchema = z.object({
  id: z.string(),
  clientId: z.string().min(1, "يجب اختيار الموكل وربطه بالقضية"),
  // KSA Court Enum — Must match CourtType exactly
  court: z.enum([
    'محكمة النقض',
    'محكمة الاستئناف',
    'المحكمة الابتدائية',
    'محكمة الجنح',
    'محكمة الجنايات',
    'المحكمة الإدارية',
    'محكمة الأسرة',
    'المحكمة الاقتصادية',
    'محكمة العمال',
    'هيئة التحكيم'
  ]),
  plaintiff: z.string().min(1),
  defendant: z.string().min(1),
  status: z.enum(['نشطة', 'تحت الدراسة', 'مغلقة']),
  createdAt: z.string()
});

export type CaseValidationData = z.infer<typeof CaseSchema>;

// Invoice Schema (Validation)
export const InvoiceSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  subtotal: z.number().positive(),
  vatAmount: z.number().nonnegative(),
  total: z.number().positive()
}).refine(data => {
  // Ensure VAT amount equals exactly 15% of subtotal
  const expectedVat = data.subtotal * 0.15;
  return Math.abs(data.vatAmount - expectedVat) < 0.01;
}, {
  message: "الضريبة يجب أن تكون 15% من القيمة الإجمالية",
  path: ['vatAmount']
}).refine(data => {
  const expectedTotal = data.subtotal + data.vatAmount;
  return Math.abs(data.total - expectedTotal) < 0.01;
}, {
  message: "المجموع الكلي غير مطابق لمجموع القيمة الأساسية مع الضريبة",
  path: ['total']
});

export type InvoiceValidationData = z.infer<typeof InvoiceSchema>;
