export interface DebtorAsset {
  id: string;
  enforcementCaseId: string;
  type: 'حساب بنكي' | 'عقار' | 'مركبة' | 'أخرى';
  description: string;
  estimatedValue?: number;
  isFrozen?: boolean;
}

export interface EnforcementOrder {
  id: string;
  enforcementCaseId: string;
  type: 'إشعار 46' | 'أمر حجز' | 'منع سفر' | 'إفراج' | 'أخرى';
  issuedAt: string;
  referenceNumber?: string;
  status: 'نشط' | 'منفذ' | 'ملغي';
}

export interface EnforcementAction {
  id: string;
  enforcementCaseId: string;
  title: string;
  notes?: string;
  date: string;
  performedBy: string;
  type: 'إجراء نظامي' | 'اتصال' | 'مذكرة' | 'تحصيل' | 'أخرى';
}

export type EnforcementSource = 'قضية_مكتب' | 'حكم_خارجي';
export type ExecutionDocType = 'حكم قضائي' | 'شيك' | 'كمبيالة' | 'عقد موثق' | 'محضر صلح' | 'أخرى';

export interface EnforcementCase {
  id: string;
  tenantId?: string;

  /** رقم ملف التنفيذ الداخلي - كود فريد للبحث السريع */
  fileNumber: string; // ENF-2026-0001

  /** مصدر ملف التنفيذ: من قضية مكتب أو حكم خارجي */
  source: EnforcementSource;

  caseId: string;
  clientId: string;
  clientName: string;
  debtorName: string;
  amountClaimed: number;
  amountCollected: number;
  status: 'مفتوح' | 'تحت إجراء 46' | 'حجز/منع' | 'محصل جزئي' | 'مغلق';
  stageDeadline?: string;
  createdAt: string;

  /** نوع السند التنفيذي */
  executionType: ExecutionDocType;

  /** رقم الحكم أو السند التنفيذي */
  judgmentNumber?: string;
  /** تاريخ صدور الحكم */
  judgmentDate?: string;
  /** المحكمة المُصدِرة للحكم */
  judgmentCourt?: string;

  /** رقم القضية الأصلية في المكتب (للربط التلقائي) */
  linkedCaseId?: string;
  /** مرجع القضية الأصلية للعرض */
  linkedCaseRef?: string;

  actions: EnforcementAction[];
  orders: EnforcementOrder[];
  assets: DebtorAsset[];
}
