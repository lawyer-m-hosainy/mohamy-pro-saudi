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

export interface EnforcementCase {
  id: string;
  tenantId?: string;
  caseId: string;
  clientId: string;
  clientName: string;
  debtorName: string;
  amountClaimed: number;
  amountCollected: number;
  status: 'مفتوح' | 'تحت إجراء 46' | 'حجز/منع' | 'محصل جزئي' | 'مغلق';
  stageDeadline?: string;
  createdAt: string;
  actions: EnforcementAction[];
  orders: EnforcementOrder[];
  assets: DebtorAsset[];
}
