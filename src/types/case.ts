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
  | 'هيئة التحكيم';

export interface Case {
  id: string;
  tenantId?: string;
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
