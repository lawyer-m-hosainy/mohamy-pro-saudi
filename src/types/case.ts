import { Document } from './common';

export type CourtType =
  | 'محكمة النقض'
  | 'محكمة الاستئناف'
  | 'المحكمة الابتدائية'
  | 'محكمة الجنح'
  | 'محكمة الجنايات'
  | 'المحكمة الإدارية'
  | 'محكمة الأسرة'
  | 'المحكمة الاقتصادية'
  | 'محكمة العمال'
  | 'هيئة التحكيم'
  // These four were already used throughout mock data and stores
  // (useCasesStore.ts, useEnforcementStore.ts, mocks/data.ts) without ever
  // being in this list — `tsc --noEmit` was catching real type errors
  // that nobody had been looking at (npm run lint / CI's "Type check"
  // step). Added rather than rewriting every existing usage, since these
  // are all real, distinct Saudi court/authority names in everyday use
  // alongside the ones above.
  | 'المحكمة التجارية'
  | 'المحكمة العامة'
  | 'المحكمة العمالية'
  | 'المحكمة الجزائية'
  | 'ديوان المظالم';

export interface Case {
  id: string; // real DB uuid — never user-entered, see caseReference for that
  tenantId?: string;
  // The manually-entered case file reference (e.g. "45-123-ت"). Used to be
  // stored directly in `id`, which is a uuid column — every case creation
  // failed at the database. This is a separate, purely display field.
  caseReference?: string;
  clientId: string; // رابط مع الموكل (Mandatory)
  clientRole?: 'مدعي' | 'مدعى عليه'; // صفة الموكل
  workflowStage?: 'intake' | 'pleadings' | 'hearing' | 'judgment' | 'closed';
  court: CourtType;
  circuit?: string; // الدائرة
  title?: string; // مسمى القضية
  automatedNumber?: string; // الرقم الآلي
  circulationCode?: string; // كود التداول
  archiveCode?: string; // كود الحفظ
  type: 'تجاري' | 'عمالي' | 'عام' | 'جزائي' | 'أحوال شخصية' | 'إداري';
  plaintiff: string; // المدعي
  defendant: string; // المدعى عليه
  memorandums: string[]; // مذكرات ولوائح (NEVER USE صحائف)
  documents?: Document[];
  powerOfAttorneyRef: string; // رقم الوكالة (NEVER USE توكيل)
  // Used by src/views/Cases.tsx, NewCaseDialog.tsx, useCasesStore.ts and
  // useCases.ts (linkCaseToNajiz) but was missing from this type entirely —
  // every read/write of it was silently untyped.
  najizReferenceStatus?: 'مربوط بناجز' | 'غير مربوط';
  status: 'متداولة' | 'مغلقة' | 'تحت الدراسة' | 'محفوظة';
  externalPlatformRef?: string; // ربط بمنظومة التقاضي الإلكتروني
  createdAt: string;
}

export interface Session {
  id: string;
  caseId: string;
  caseName: string;
  date: string;
  time: string;
  court: string;
  notes?: string;
  status: 'قادمة' | 'منتهية' | 'مؤجلة';
}

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  date: string;
  type: 'تقديم مذكرة' | 'موعد جلسة' | 'انتهاء مدة استئناف' | 'أخرى';
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

export interface SpecializedWorkflowStep {
  id: string;
  name: string;
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface SpecializedTrack {
  id: string;
  tenantId?: string;
  caseId: string;
  caseType: 'عمالي' | 'جزائي';
  stage: string;
  slaDueAt?: string;
  status: 'نشط' | 'متأخر' | 'مغلق';
  checklist: {
    id: string;
    title: string;
    done: boolean;
  }[];
  documentTemplates: {
    id: string;
    title: string;
    type: 'مذكرة' | 'صحيفة' | 'لائحة' | 'اعتراض' | 'أخرى';
  }[];
  steps: SpecializedWorkflowStep[];
  createdAt: string;
}
