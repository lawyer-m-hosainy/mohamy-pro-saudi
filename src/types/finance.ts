export interface Expense {
  id: string;
  caseId: string;
  caseName: string;
  category: 'رسوم قضائية' | 'أتعاب خبراء' | 'تنقلات' | 'أخرى';
  amount: number;
  date: string;
  status: 'تم السداد' | 'معلق' | 'مسترد من العميل';
  description: string;
}

export interface TimeEntry {
  id: string;
  lawyerId: string;
  caseId: string;
  description: string;
  duration: number; // in minutes
  date: string;
  isBilled: boolean;
}

export interface TrustAccount {
  id: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  amount: number;
  type: 'أمانة' | 'مقدم أتعاب' | 'مبلغ تنفيذ';
  status: 'نشط' | 'تم الصرف' | 'مسترد';
  description: string;
  date: string;
}

export type PricingStructure = 'ساعة' | 'مقطوع' | 'شهري' | 'مرحلي';

export interface PricingModel {
  id: string;
  type: PricingStructure;
  rate?: number; // Hourly rate or Fixed amount
  retainerAmount?: number;
  description: string;
  phases?: {
    name: string;
    amount: number;
    completionCriteria: string;
  }[];
}

export interface CollectionAction {
  id: string;
  receivableId: string;
  type: 'إصدار مطالبة' | 'إنذار قانوني' | 'جدولة سداد' | 'تسوية' | 'متابعة';
  notes?: string;
  amount?: number;
  createdAt: string;
  createdBy: string;
}

export interface PaymentPlan {
  id: string;
  receivableId: string;
  installments: {
    dueDate: string;
    amount: number;
    paid: boolean;
  }[];
  status: 'نشط' | 'مكتمل' | 'متأخر';
  createdAt: string;
}

export interface ReceivableAccount {
  id: string;
  tenantId?: string;
  caseId: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: 'مفتوح' | 'متأخر' | 'تحت التحصيل' | 'مسوى' | 'مغلق';
  isReconciled: boolean;
  actions: CollectionAction[];
  paymentPlan?: PaymentPlan;
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantId?: string;
  clientId: string;
  clientName: string;
  base: number;
  vat: number;
  total: number;
  status: 'مدفوعة' | 'غير مدفوعة' | 'مسودة';
  date: string;
}
