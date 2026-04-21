// 1. STRICT KSA JURISDICTION (Court Types)
export type KSACourtType = 
  | 'المحكمة العليا'
  | 'محكمة الاستئناف'
  | 'المحكمة العامة'
  | 'المحكمة الجزائية'
  | 'المحكمة التجارية'
  | 'المحكمة العمالية'
  | 'محكمة الأحوال الشخصية'
  | 'ديوان المظالم' // Administrative Court
  | 'لجان شبه قضائية';

export type UserRole = 'مدير مكتب' | 'محامي' | 'سكرتير' | 'محامي شريك' | 'محامي مستشار' | 'محامي متدرب';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// 2. SAUDI CLIENT IDENTITY MANAGEMENT
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
  phone: string; // Format: +9665XXXXXXXX
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

export interface Document {
  id: string;
  name: string;
  url: string;
  type: 'مذكرة' | 'لائحة' | 'حكم' | 'أخرى';
  createdAt: string;
}

// 3. KSA PROCEDURAL TERMINOLOGY
export interface Case {
  id: string;
  tenantId?: string;
  clientId: string; // رابط مع الموكل (Mandatory)
  workflowStage?: 'intake' | 'pleadings' | 'hearing' | 'judgment' | 'closed';
  court: KSACourtType;
  type: 'تجاري' | 'عمالي' | 'عام' | 'جزائي' | 'أحوال شخصية' | 'إداري';
  plaintiff: string; // المدعي
  defendant: string; // المدعى عليه
  memorandums: string[]; // مذكرات ولوائح (NEVER USE صحائف)
  documents?: Document[];
  powerOfAttorneyRef: string; // رقم الوكالة (NEVER USE توكيل)
  status: 'نشطة' | 'مغلقة' | 'تحت الدراسة';
  najizReferenceStatus?: 'مربوط بناجز' | 'غير مربوط'; // Najiz Platform Tracker
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

// 4. FINANCIALS (15% VAT) — see Invoice definition at the end of this file

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  caseId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
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

export interface OfficeSettings {
  name: string;
  vatNumber: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

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

export interface TeamMember extends UserProfile {
  activeCases: number;
  pendingTasks: number;
  completedTasks: number;
  joinDate: string;
  status: 'نشط' | 'في إجازة' | 'غير نشط';
}

export interface ComplianceRecord {
  id: string;
  title: string;
  type: 'سجل تجاري' | 'ترخيص استثمار' | 'شهادة زكاة' | 'أخرى';
  expiryDate: string;
  status: 'ساري' | 'منتهي' | 'قريب الانتهاء';
  reminderDays: number;
}

export interface LegalPrecedent {
  id: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  fileUrl?: string;
  date: string;
}

export interface ContractTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'تجاري' | 'عمالي' | 'عقاري' | 'أحوال شخصية';
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

export interface IPRecord {
  id: string;
  title: string;
  type: 'علامة تجارية' | 'براءة اختراع' | 'حق مؤلف';
  owner: string;
  registrationNumber: string;
  expiryDate: string;
  status: 'مسجلة' | 'تحت الفحص' | 'منتهية';
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

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
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

// 5. BD & KEY ACCOUNTS (New Enterprise Module)
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

export interface Proposal {
  id: string;
  title: string;
  keyAccountId?: string;
  leadId?: string;
  status: 'مسودة' | 'مرسلة' | 'قيد التفاوض' | 'مقبولة' | 'مرفوضة' | 'ملغاة';
  value: number;
  pricingModelId: string;
  validUntil: string;
  assignedLawyerId: string;
  winProbability: number; // 0-100
  tags: string[];
  createdAt: string;
}

export interface RFPSubmission {
  id: string;
  proposalId: string;
  authority: string;
  deadline: string;
  submissionDate?: string;
  requirements: {
    title: string;
    isMet: boolean;
  }[];
  status: 'تحت الإعداد' | 'تم التقديم' | 'مستبعد' | 'فوز';
}

export interface ESignatureRequest {
  id: string;
  documentName: string;
  recipientName: string;
  recipientEmail: string;
  status: 'بانتظار التوقيع' | 'تم التوقيع' | 'منتهي الصلاحية';
  sentDate: string;
  signedDate?: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: 'أبحاث' | 'إجراءات' | 'نماذج' | 'أنظمة';
  author: string;
  lastUpdated: string;
  tags: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: {
    order: number;
    action: string;
    assignedTo: string;
  }[];
  isActive: boolean;
}

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

export interface AdvisoryOpinion {
  id: string;
  requestId: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface ApprovalFlow {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  status: 'بانتظار الاعتماد' | 'معتمد' | 'مرفوض';
  decidedAt?: string;
  notes?: string;
}

export interface AdvisoryRequest {
  id: string;
  tenantId?: string;
  title: string;
  clientName: string;
  requestedBy: string;
  assignedTo: string;
  status: 'جديد' | 'قيد المراجعة' | 'مسودة رأي' | 'اعتماد شريك' | 'مغلق';
  priority: 'منخفض' | 'متوسط' | 'عالي';
  slaDueAt: string;
  createdAt: string;
  closedAt?: string;
  opinions: AdvisoryOpinion[];
  approvals: ApprovalFlow[];
}

export interface RiskRegister {
  id: string;
  tenantId?: string;
  title: string;
  category: 'تشغيلي' | 'قانوني' | 'تقني' | 'مالي' | 'امتثال';
  severity: 'High' | 'Medium' | 'Low';
  status: 'مفتوح' | 'قيد المعالجة' | 'مغلق';
  ownerId: string;
  mitigationPlan: string;
  dueDate?: string;
  createdAt: string;
}

export interface Control {
  id: string;
  tenantId?: string;
  title: string;
  controlType: 'وقائي' | 'كاشف' | 'تصحيحي';
  ownerId: string;
  frequency: 'يومي' | 'أسبوعي' | 'شهري' | 'ربع سنوي';
  status: 'فعال' | 'بحاجة تحسين' | 'متوقف';
  lastReviewAt?: string;
  createdAt: string;
}

export interface ComplianceIssue {
  id: string;
  tenantId?: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'جديد' | 'قيد المعالجة' | 'مغلق';
  ownerId: string;
  dueDate?: string;
  evidenceUrls?: string[];
  createdAt: string;
}

export interface RegulatoryObligation {
  id: string;
  tenantId?: string;
  title: string;
  regulator: string;
  dueDate: string;
  status: 'ملتزم' | 'قريب الاستحقاق' | 'متأخر';
  ownerId: string;
  notes?: string;
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

export interface ContractVersion {
  id: string;
  requestId: string;
  versionNumber: number;
  content: string;
  createdBy: string;
  createdAt: string;
  changeSummary?: string;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  status: 'بانتظار الاعتماد' | 'معتمد' | 'مرفوض';
  notes?: string;
  decidedAt?: string;
}

export interface ContractObligation {
  id: string;
  requestId: string;
  title: string;
  dueDate: string;
  ownerId: string;
  status: 'قادم' | 'مكتمل' | 'متأخر';
}

export interface ContractRequest {
  id: string;
  tenantId?: string;
  title: string;
  clientName: string;
  stage: 'طلب' | 'تفاوض' | 'مراجعة' | 'اعتماد' | 'توقيع' | 'متابعة التزامات' | 'تجديد/إنهاء';
  status: 'مسودة' | 'قيد التنفيذ' | 'معتمد' | 'موقع' | 'مغلق';
  createdBy: string;
  createdAt: string;
  renewalDate?: string;
  versions: ContractVersion[];
  approvals: ApprovalStep[];
  obligations: ContractObligation[];
}

export interface IPFiling {
  id: string;
  tenantId?: string;
  ipRecordId: string;
  clientName: string;
  type: 'علامة تجارية' | 'براءة اختراع' | 'حق مؤلف';
  filingDate: string;
  authority: string;
  status: 'قيد التقديم' | 'قيد الفحص' | 'مقبول' | 'مرفوض';
  feeAmount?: number;
  documentUrls?: string[];
}

export interface IPRenewal {
  id: string;
  tenantId?: string;
  ipRecordId: string;
  dueDate: string;
  status: 'قادم' | 'مكتمل' | 'متأخر';
  feeAmount?: number;
  paid: boolean;
  receiptUrl?: string;
}

export interface IPOpposition {
  id: string;
  tenantId?: string;
  ipRecordId: string;
  againstParty: string;
  reason: string;
  filedAt: string;
  status: 'مسجل' | 'قيد النظر' | 'محسوم';
  documentUrls?: string[];
}

export interface IPEnforcementAction {
  id: string;
  tenantId?: string;
  ipRecordId: string;
  actionType: 'إنذار' | 'دعوى' | 'تسوية' | 'تنفيذ حكم';
  description: string;
  actionDate: string;
  status: 'مفتوح' | 'قيد المتابعة' | 'مغلق';
  feeAmount?: number;
  documentUrls?: string[];
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

export interface QAReview {
  id: string;
  caseId: string;
  documentId?: string;
  reviewerId: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'RequiresChanges';
  checklist: {
    id: string;
    requirement: string;
    isMet: boolean;
    comment?: string;
  }[];
  overallComment?: string;
  completedAt?: string;
  partnerOverride?: boolean;
}

export interface KnowledgeAsset {
  id: string;
  title: string;
  category: 'Research' | 'Precedent' | 'Procedure' | 'Template';
  tags: string[];
  contentUrl: string;
  version: number;
  authorId: string;
  isVerified: boolean;
  verifiedBy?: string;
  linkedCaseIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPathway {
  id: string;
  userId: string;
  title: string;
  description: string;
  modules: {
    id: string;
    title: string;
    status: 'NotStarted' | 'InProgress' | 'Completed';
    completedAt?: string;
    score?: number;
  }[];
  mentorId: string;
  overallProgress: number; // 0-100
  startDate: string;
  endDate?: string;
}

export interface KSAAssessment {
  id: string;
  pathwayId: string;
  title: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctOption: number;
    userAnswer?: number;
  }[];
  passingScore: number;
  userScore?: number;
  isPassed?: boolean;
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
