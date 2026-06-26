export interface Client {
  id: string;
  tenantId?: string;
  type: 'فرد' | 'منشأة'; // Individual or Entity
  name: string;
  
  // Strict Validation Fields
  nationalId?: string; // الهوية الوطنية / الإقامة (Must be for 'فرد')
  commercialRegistration?: string; // رقم السجل التجاري (Must be for 'منشأة')
  vatNumber?: string; // الرقم الضريبي - 15 Digits ZATCA rule
  
  // Advanced Relationship Mapping
  parentEntityId?: string; // الشركة الأم
  subsidiaries?: string[]; // الشركات التابعة
  shareholders?: { name: string; percentage: number; id?: string }[]; // المساهمون
  boardMembers?: { name: string; position: string; id?: string }[]; // أعضاء مجلس الإدارة
  relatedEntities?: string[]; // كيانات ذات علاقة
  
  // Phone must default to KSA Mask
  phone: string; // Format: +20XXXXXXXXXX (مصر) أو +966XXXXXXXXX (السعودية)
}

export interface ConflictCheckRecord {
  id: string;
  query: string;
  checkedAt: string;
  checkedBy: string;
  status: 'Clear' | 'DirectConflict' | 'IndirectConflict' | 'Waived';
  matches: {
    entityName: string;
    relationshipType: 'Client' | 'AdverseParty' | 'Subsidiary' | 'Shareholder' | 'BoardMember';
    relatedToId: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
  }[];
  resolutionNotes?: string;
  resolutionDate?: string;
  resolvedBy?: string;
}

export interface ConflictCheck {
  id: string;
  query: string;
  results: {
    type: 'عميل' | 'قضية' | 'خصم';
    name: string;
    status: string;
    matchScore: number;
  }[];
  checkedBy: string;
  date: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: 'موقع إلكتروني' | 'توصية' | 'وسائل تواصل' | 'أخرى';
  interest: string;
  status: 'جديد' | 'قيد التواصل' | 'تم تحديد موعد' | 'تحول لعميل' | 'مستبعد';
  createdAt: string;
}

export interface KeyAccount {
  id: string;
  clientId: string;
  accountManagerId: string;
  strategicValue: 'High' | 'Medium' | 'Low';
  industry: string;
  annualTargetRevenue: number;
  currentPipeValue: number;
  growthPlan?: string;
  notes?: string;
}
