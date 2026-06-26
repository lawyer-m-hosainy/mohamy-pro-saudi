import { 
  Client, Case, CourtType, Session, UserProfile, Notification, Task, OfficeSettings, Expense, TeamMember,
  ComplianceRecord, LegalPrecedent, ContractTemplate, IPRecord, TimeEntry, Deadline, EnforcementCase, AdvisoryRequest,
  RiskRegister, Control, ComplianceIssue, RegulatoryObligation, ReceivableAccount, ContractRequest, IPFiling, IPRenewal, IPOpposition, IPEnforcementAction,
  SpecializedTrack, KeyAccount, Proposal, PricingModel, QAReview, KnowledgeAsset, TrainingPathway, KSAAssessment, ConflictCheckRecord
} from "../types";

const courtTypes: CourtType[] = [
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
];

export const mockUser: UserProfile = {
  id: 'U-001',
  name: 'د. عبدالمحسن القحطاني',
  email: 'm.hosainy.law@gmail.com',
  role: 'مدير مكتب',
  avatar: 'https://picsum.photos/seed/lawyer/200/200'
};

export const mockOfficeSettings: OfficeSettings = {
  name: 'مكتب د. عبدالمحسن القحطاني للمحاماة',
  vatNumber: '300012345600003',
  address: 'الرياض، حي الملقا، طريق الملك فهد',
  phone: '+966112345678',
  email: 'info@alqahtani-law.sa',
  logo: 'https://picsum.photos/seed/law-logo/200/200'
};

export const mockNotifications: Notification[] = [
  { id: 'N-1', title: 'موعد جلسة قادم', description: 'قضية شركة الراجحي - غداً الساعة 10:00 صباحاً', type: 'warning', isRead: false, createdAt: '2024-04-07T10:00:00Z' },
  { id: 'N-2', title: 'تحديث من ناجز', description: 'تم تحديث حالة 3 قضايا مرتبطة بنجاح.', type: 'success', isRead: true, createdAt: '2024-04-06T15:30:00Z' },
  { id: 'N-3', title: 'عميل جديد', description: 'تمت إضافة "خالد بن وليد الشمري" إلى قائمة العملاء.', type: 'info', isRead: false, createdAt: '2024-04-07T09:15:00Z' },
];

export const mockTasks: Task[] = [
  { id: 'T-1', caseId: 'C-1001', title: 'تجهيز اللائحة الاعتراضية', assignedTo: 'U-001', dueDate: '2024-04-10', status: 'pending', priority: 'high' },
  { id: 'T-2', caseId: 'C-1003', title: 'مراجعة عقد التأسيس', assignedTo: 'U-001', dueDate: '2024-04-12', status: 'pending', priority: 'medium' },
  { id: 'T-3', caseId: 'C-1005', title: 'سداد الرسوم القضائية', assignedTo: 'U-001', dueDate: '2024-04-08', status: 'completed', priority: 'low' },
];

export const mockClients: Client[] = [
  { id: '1', name: 'شركة الراجحي العقارية', type: 'منشأة', commercialRegistration: '1010123456', vatNumber: '300012345600003', phone: '+966501234567' },
  { id: '2', name: 'محمد بن سلمان العتيبي', type: 'فرد', nationalId: '1098765432', phone: '+966551234567' },
  { id: '3', name: 'مؤسسة الحلول الرقمية', type: 'منشأة', commercialRegistration: '1010987654', vatNumber: '300098765400003', phone: '+966541234567' },
  { id: '4', name: 'سارة بنت خالد الفهد', type: 'فرد', nationalId: '1087654321', phone: '+966561234567' },
  { id: '5', name: 'شركة النهضة للمقاولات', type: 'منشأة', commercialRegistration: '1010555666', vatNumber: '300055566600003', phone: '+966531234567' },
  { id: '6', name: 'فهد بن عبدالعزيز الجبر', type: 'فرد', nationalId: '1076543210', phone: '+966509876543' },
  { id: '7', name: 'مجموعة تداول السعودية', type: 'منشأة', commercialRegistration: '1010111222', vatNumber: '300011122200003', phone: '+966559876543' },
  { id: '8', name: 'نورة بنت سعد القحطاني', type: 'فرد', nationalId: '1065432109', phone: '+966549876543' },
  { id: '9', name: 'شركة الاتصالات السعودية', type: 'منشأة', commercialRegistration: '1010222333', vatNumber: '300022233300003', phone: '+966569876543' },
  { id: '10', name: 'خالد بن وليد الشمري', type: 'فرد', nationalId: '1054321098', phone: '+966539876543' },
];

export const mockCases: Case[] = [
  { 
    id: 'C-1001', 
    clientId: '1', // شركة الراجحي العقارية
    court: 'المحكمة التجارية', 
    type: 'تجاري',
    plaintiff: 'شركة الراجحي العقارية', 
    defendant: 'شركة النهضة للمقاولات', 
    memorandums: ['مذكرة جوابية أولى', 'لائحة اعتراضية'], 
    powerOfAttorneyRef: '441234567', 
    status: 'نشطة', 
    externalPlatformRef: 'مربوط بناجز',
    createdAt: '2024-01-15'
  },
  { 
    id: 'C-1002', 
    clientId: '2', // محمد بن سلمان العتيبي
    court: 'المحكمة العامة', 
    type: 'عام',
    plaintiff: 'محمد بن سلمان العتيبي', 
    defendant: 'فهد بن عبدالعزيز الجبر', 
    memorandums: ['لائحة دعوى'], 
    powerOfAttorneyRef: '449876543', 
    status: 'تحت الدراسة', 
    externalPlatformRef: 'غير مربوط',
    createdAt: '2024-02-10'
  },
  { 
    id: 'C-1003', 
    clientId: '4', // سارة بنت خالد الفهد
    court: 'المحكمة العمالية', 
    type: 'عمالي',
    plaintiff: 'سارة بنت خالد الفهد', 
    defendant: 'مؤسسة الحلول الرقمية', 
    memorandums: ['مذكرة دفاع'], 
    powerOfAttorneyRef: '445556667', 
    status: 'نشطة', 
    externalPlatformRef: 'مربوط بناجز',
    createdAt: '2024-03-05'
  },
  { 
    id: 'C-1004', 
    clientId: '5', // شركة النهضة للمقاولات
    court: 'ديوان المظالم', 
    type: 'إداري',
    plaintiff: 'شركة النهضة للمقاولات', 
    defendant: 'وزارة الشؤون البلدية والقروية', 
    memorandums: ['تظلم إداري'], 
    powerOfAttorneyRef: '441112223', 
    status: 'مغلقة', 
    externalPlatformRef: 'مربوط بناجز',
    createdAt: '2023-12-20'
  },
  { 
    id: 'C-1005', 
    clientId: '10', // خالد بن وليد الشمري
    court: 'المحكمة الجزائية', 
    type: 'جزائي',
    plaintiff: 'الحق العام', 
    defendant: 'خالد بن وليد الشمري', 
    memorandums: ['مذكرة رد'], 
    powerOfAttorneyRef: '442223334', 
    status: 'نشطة', 
    externalPlatformRef: 'غير مربوط',
    createdAt: '2024-03-25'
  },
];

export const mockSessions: Session[] = [
  { id: 'S-001', caseId: 'C-1001', caseName: 'الراجحي ضد النهضة', date: '2024-04-10', time: '10:00', court: 'المحكمة التجارية بالرياض', status: 'قادمة' },
  { id: 'S-002', caseId: 'C-1003', caseName: 'سارة الفهد ضد الحلول الرقمية', date: '2024-04-12', time: '09:30', court: 'المحكمة العمالية بجدة', status: 'قادمة' },
  { id: 'S-003', caseId: 'C-1005', caseName: 'الحق العام ضد خالد الشمري', date: '2024-04-15', time: '11:00', court: 'المحكمة الجزائية بالدمام', status: 'قادمة' },
];

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', caseId: 'C-1001', caseName: 'شركة الراجحي ضد شركة النهضة', category: 'رسوم قضائية', amount: 2500, date: '2024-03-15', status: 'تم السداد', description: 'رسوم قيد الدعوى في المحكمة التجارية' },
  { id: 'EXP-002', caseId: 'C-1005', caseName: 'الحق العام ضد خالد الشمري', category: 'أتعاب خبراء', amount: 5000, date: '2024-03-20', status: 'معلق', description: 'أتعاب خبير تقني لتقييم الأضرار' },
  { id: 'EXP-003', caseId: 'C-1001', caseName: 'شركة الراجحي ضد شركة النهضة', category: 'تنقلات', amount: 350, date: '2024-03-22', status: 'مسترد من العميل', description: 'تكاليف السفر لحضور جلسة في جدة' },
];

export const mockTeamMembers: TeamMember[] = [
  { 
    id: 'U-001', 
    name: 'د. عبدالمحسن القحطاني', 
    email: 'm.hosainy.law@gmail.com', 
    role: 'محامي شريك', 
    avatar: 'https://picsum.photos/seed/lawyer1/100/100',
    activeCases: 12,
    pendingTasks: 5,
    completedTasks: 45,
    joinDate: '2020-01-01',
    status: 'نشط'
  },
  { 
    id: 'U-002', 
    name: 'أ. سارة الشمري', 
    email: 'sara@alqahtanilaw.sa', 
    role: 'محامي مستشار', 
    avatar: 'https://picsum.photos/seed/lawyer2/100/100',
    activeCases: 8,
    pendingTasks: 3,
    completedTasks: 32,
    joinDate: '2021-06-15',
    status: 'نشط'
  },
  { 
    id: 'U-003', 
    name: 'أ. فهد العتيبي', 
    email: 'fahad@alqahtanilaw.sa', 
    role: 'محامي متدرب', 
    avatar: 'https://picsum.photos/seed/lawyer3/100/100',
    activeCases: 4,
    pendingTasks: 7,
    completedTasks: 12,
    joinDate: '2023-09-01',
    status: 'نشط'
  }
];

export const mockCompliance: ComplianceRecord[] = [
  { id: 'COMP-1', title: 'السجل التجاري للمكتب', type: 'سجل تجاري', expiryDate: '2025-01-01', status: 'ساري', reminderDays: 30 },
  { id: 'COMP-2', title: 'ترخيص مزاولة المهنة', type: 'ترخيص استثمار', expiryDate: '2024-06-15', status: 'قريب الانتهاء', reminderDays: 15 },
];

export const mockPrecedents: LegalPrecedent[] = [
  { id: 'PREC-1', title: 'حكم في قضية منازعة تجارية', category: 'تجاري', summary: 'إثبات صحة عقد توريد بناءً على المراسلات الإلكترونية.', tags: ['عقود', 'تجاري', 'إثبات'], date: '2023-11-10' },
  { id: 'PREC-2', title: 'مذكرة دفاع في قضية عمالية', category: 'عمالي', summary: 'رد على دعوى فصل تعسفي بناءً على المادة 80 من نظام العمل.', tags: ['عمالي', 'فصل تعسفي'], date: '2024-01-20' },
];

export const mockContracts: ContractTemplate[] = [
  { id: 'TMP-1', title: 'عقد تأسيس شركة مبسط', description: 'نموذج متوافق مع نظام الشركات الجديد.', content: '...', category: 'تجاري' },
  { id: 'TMP-2', title: 'عقد عمل سعودي', description: 'نموذج متوافق مع نظام العمل السعودي.', content: '...', category: 'عمالي' },
];

export const mockIP: IPRecord[] = [
  { id: 'IP-1', title: 'شعار شركة الراجحي', type: 'علامة تجارية', owner: 'شركة الراجحي العقارية', registrationNumber: '123456', expiryDate: '2030-01-01', status: 'مسجلة' },
  { id: 'IP-2', title: 'نظام إدارة قانوني', type: 'حق مؤلف', owner: 'د. عبدالمحسن القحطاني', registrationNumber: '789012', expiryDate: '2028-05-20', status: 'تحت الفحص' },
];

export const mockTimeEntries: TimeEntry[] = [
  { id: 'TIME-1', lawyerId: 'U-001', caseId: 'C-1001', description: 'دراسة ملف القضية وكتابة المذكرة', duration: 120, date: '2024-04-07', isBilled: false },
  { id: 'TIME-2', lawyerId: 'U-002', caseId: 'C-1003', description: 'جلسة استماع في المحكمة العمالية', duration: 90, date: '2024-04-06', isBilled: true },
];

export const mockDeadlines: Deadline[] = [
  { id: 'D-1', caseId: 'C-1001', title: 'تقديم اللائحة الاعتراضية', date: '2024-04-15', type: 'تقديم مذكرة', status: 'pending', priority: 'high' },
  { id: 'D-2', caseId: 'C-1003', title: 'انتهاء مهلة الاستئناف', date: '2024-04-20', type: 'انتهاء مدة استئناف', status: 'pending', priority: 'high' },
  { id: 'D-3', caseId: 'C-1005', title: 'تقديم بينة إضافية', date: '2024-04-18', type: 'أخرى', status: 'pending', priority: 'medium' },
];

export const mockEnforcementCases: EnforcementCase[] = [
  {
    id: "E-1001",
    tenantId: "demo-tenant",
    caseId: "C-1001",
    clientId: "1",
    clientName: "شركة الراجحي العقارية",
    debtorName: "شركة النهضة للمقاولات",
    amountClaimed: 185000,
    amountCollected: 50000,
    status: "محصل جزئي",
    stageDeadline: "2026-04-18",
    createdAt: "2026-03-10",
    actions: [
      { id: "EA-1", enforcementCaseId: "E-1001", title: "تقديم طلب تنفيذ", date: "2026-03-10", performedBy: "U-001", type: "إجراء نظامي" },
      { id: "EA-2", enforcementCaseId: "E-1001", title: "إصدار إشعار 46", date: "2026-03-15", performedBy: "U-001", type: "إجراء نظامي" },
      { id: "EA-3", enforcementCaseId: "E-1001", title: "تحصيل دفعة أولى", notes: "تم تحصيل دفعة 50,000", date: "2026-03-25", performedBy: "U-002", type: "تحصيل" },
    ],
    orders: [
      { id: "EO-1", enforcementCaseId: "E-1001", type: "إشعار 46", issuedAt: "2026-03-15", referenceNumber: "46-2026-991", status: "منفذ" },
    ],
    assets: [
      { id: "AS-1", enforcementCaseId: "E-1001", type: "حساب بنكي", description: "حساب تشغيلي رئيسي", estimatedValue: 120000, isFrozen: true },
    ],
  },
];

export const mockAdvisoryRequests: AdvisoryRequest[] = [
  {
    id: "AR-1001",
    tenantId: "demo-tenant",
    title: "الرأي القانوني حول بند جزائي في عقد توريد",
    clientName: "شركة الراجحي العقارية",
    requestedBy: "مدير الشؤون القانونية",
    assignedTo: "U-002",
    status: "قيد المراجعة",
    priority: "عالي",
    slaDueAt: "2026-04-12T12:00:00Z",
    createdAt: "2026-04-08T09:00:00Z",
    opinions: [],
    approvals: [
      { id: "AP-1", requestId: "AR-1001", approverId: "U-001", approverName: "د. عبدالمحسن القحطاني", status: "بانتظار الاعتماد" },
    ],
  },
  {
    id: "AR-1002",
    tenantId: "demo-tenant",
    title: "مذكرة التزام نظامي لشركة ناشئة",
    clientName: "مؤسسة الحلول الرقمية",
    requestedBy: "الرئيس التنفيذي",
    assignedTo: "U-003",
    status: "مسودة رأي",
    priority: "متوسط",
    slaDueAt: "2026-04-15T12:00:00Z",
    createdAt: "2026-04-07T10:00:00Z",
    opinions: [
      { id: "OP-1", requestId: "AR-1002", content: "تم إعداد مسودة أولية تتضمن الالتزامات النظامية الأساسية.", authorId: "U-003", createdAt: "2026-04-08T08:00:00Z" },
    ],
    approvals: [],
  },
];

export const mockRiskRegisters: RiskRegister[] = [
  {
    id: "R-001",
    tenantId: "demo-tenant",
    title: "تأخر رفع مذكرة حرجة",
    category: "قانوني",
    severity: "High",
    status: "قيد المعالجة",
    ownerId: "U-001",
    mitigationPlan: "تفعيل تنبيه مبكر + مراجعة أسبوعية للمواعيد الحرجة",
    dueDate: "2026-04-15",
    createdAt: "2026-04-08T08:00:00Z",
  },
  {
    id: "R-002",
    tenantId: "demo-tenant",
    title: "ضعف توثيق مراجعات الامتثال",
    category: "امتثال",
    severity: "Medium",
    status: "مفتوح",
    ownerId: "U-002",
    mitigationPlan: "اعتماد نموذج مراجعة موحد وربط أدلة الإثبات",
    dueDate: "2026-04-20",
    createdAt: "2026-04-08T09:00:00Z",
  },
];

export const mockControls: Control[] = [
  {
    id: "CTL-001",
    tenantId: "demo-tenant",
    title: "مراجعة صلاحيات المستخدمين",
    controlType: "وقائي",
    ownerId: "U-001",
    frequency: "شهري",
    status: "فعال",
    lastReviewAt: "2026-04-01",
    createdAt: "2026-03-01",
  },
  {
    id: "CTL-002",
    tenantId: "demo-tenant",
    title: "مراجعة سجل الأحداث الحساسة",
    controlType: "كاشف",
    ownerId: "U-002",
    frequency: "أسبوعي",
    status: "بحاجة تحسين",
    lastReviewAt: "2026-04-07",
    createdAt: "2026-03-05",
  },
];

export const mockComplianceIssues: ComplianceIssue[] = [
  {
    id: "ISS-001",
    tenantId: "demo-tenant",
    title: "نقص أدلة الامتثال لملف عميل",
    description: "لا يوجد إرفاق كامل للمستندات النظامية المطلوبة في ملف العميل.",
    severity: "Medium",
    status: "قيد المعالجة",
    ownerId: "U-003",
    dueDate: "2026-04-13",
    evidenceUrls: [],
    createdAt: "2026-04-08T07:00:00Z",
  },
];

export const mockRegulatoryObligations: RegulatoryObligation[] = [
  {
    id: "OB-001",
    tenantId: "demo-tenant",
    title: "تحديث سياسة حفظ المستندات",
    regulator: "الجهات التنظيمية المحلية",
    dueDate: "2026-04-18",
    status: "قريب الاستحقاق",
    ownerId: "U-001",
    notes: "يجب اعتماد النسخة النهائية قبل نهاية الأسبوع القادم.",
  },
];

export const mockReceivables: ReceivableAccount[] = [
  {
    id: "RCV-1001",
    tenantId: "demo-tenant",
    caseId: "C-1001",
    clientId: "1",
    clientName: "شركة الراجحي العقارية",
    totalAmount: 185000,
    collectedAmount: 50000,
    outstandingAmount: 135000,
    dueDate: "2026-04-20",
    status: "تحت التحصيل",
    isReconciled: false,
    actions: [
      { id: "CA-1", receivableId: "RCV-1001", type: "إصدار مطالبة", notes: "إرسال المطالبة الأولى", createdAt: "2026-04-05T09:00:00Z", createdBy: "U-001" },
      { id: "CA-2", receivableId: "RCV-1001", type: "إنذار قانوني", notes: "إنذار بعد 14 يوم", createdAt: "2026-04-07T10:30:00Z", createdBy: "U-001" },
    ],
    paymentPlan: {
      id: "PP-1001",
      receivableId: "RCV-1001",
      status: "نشط",
      createdAt: "2026-04-08T08:00:00Z",
      installments: [
        { dueDate: "2026-04-15", amount: 50000, paid: true },
        { dueDate: "2026-04-22", amount: 40000, paid: false },
        { dueDate: "2026-04-29", amount: 45000, paid: false },
      ],
    },
    createdAt: "2026-04-01T08:00:00Z",
  },
  {
    id: "RCV-1002",
    tenantId: "demo-tenant",
    caseId: "C-1003",
    clientId: "4",
    clientName: "سارة بنت خالد الفهد",
    totalAmount: 30000,
    collectedAmount: 30000,
    outstandingAmount: 0,
    dueDate: "2026-04-05",
    status: "مسوى",
    isReconciled: true,
    actions: [
      { id: "CA-3", receivableId: "RCV-1002", type: "تسوية", notes: "سداد كامل", amount: 30000, createdAt: "2026-04-05T12:00:00Z", createdBy: "U-002" },
    ],
    createdAt: "2026-03-20T08:00:00Z",
  },
];

export const mockContractRequests: ContractRequest[] = [
  {
    id: "CR-1001",
    tenantId: "demo-tenant",
    title: "عقد توريد مواد بناء",
    clientName: "شركة الراجحي العقارية",
    stage: "اعتماد",
    status: "قيد التنفيذ",
    createdBy: "U-001",
    createdAt: "2026-04-05T08:00:00Z",
    renewalDate: "2027-04-05",
    versions: [
      {
        id: "CV-1",
        requestId: "CR-1001",
        versionNumber: 1,
        content: "المسودة الأولى لعقد التوريد...",
        createdBy: "U-002",
        createdAt: "2026-04-05T09:00:00Z",
        changeSummary: "نسخة أولية",
      },
      {
        id: "CV-2",
        requestId: "CR-1001",
        versionNumber: 2,
        content: "المسودة الثانية مع تعديل بنود الجزاء...",
        createdBy: "U-001",
        createdAt: "2026-04-07T11:00:00Z",
        changeSummary: "تعديل بند الجزاء ومدة التوريد",
      },
    ],
    approvals: [
      {
        id: "APC-1",
        requestId: "CR-1001",
        approverId: "U-001",
        approverName: "د. عبدالمحسن القحطاني",
        status: "بانتظار الاعتماد",
      },
    ],
    obligations: [
      {
        id: "OBL-1",
        requestId: "CR-1001",
        title: "تسليم الدفعة الأولى",
        dueDate: "2026-04-20",
        ownerId: "U-002",
        status: "قادم",
      },
    ],
  },
];

export const mockIPFilings: IPFiling[] = [
  {
    id: "IPF-001",
    tenantId: "demo-tenant",
    ipRecordId: "IP-1",
    clientName: "شركة الراجحي العقارية",
    type: "علامة تجارية",
    filingDate: "2026-03-01",
    authority: "SAIP",
    status: "قيد الفحص",
    feeAmount: 1500,
    documentUrls: [],
  },
];

export const mockIPRenewals: IPRenewal[] = [
  {
    id: "IPR-001",
    tenantId: "demo-tenant",
    ipRecordId: "IP-1",
    dueDate: "2026-04-20",
    status: "قادم",
    feeAmount: 1200,
    paid: false,
  },
];

export const mockIPOppositions: IPOpposition[] = [
  {
    id: "IPO-001",
    tenantId: "demo-tenant",
    ipRecordId: "IP-1",
    againstParty: "شركة منافسة",
    reason: "تشابه علامة تجارية",
    filedAt: "2026-04-01",
    status: "قيد النظر",
    documentUrls: [],
  },
];

export const mockIPEnforcementActions: IPEnforcementAction[] = [
  {
    id: "IPE-001",
    tenantId: "demo-tenant",
    ipRecordId: "IP-1",
    actionType: "إنذار",
    description: "إرسال إنذار رسمي بوقف التعدي على العلامة",
    actionDate: "2026-04-03",
    status: "قيد المتابعة",
    feeAmount: 800,
    documentUrls: [],
  },
];

export const mockSpecializedTracks: SpecializedTrack[] = [
  {
    id: "ST-LAB-001",
    tenantId: "demo-tenant",
    caseId: "C-1003",
    caseType: "عمالي",
    stage: "مواعيد الاعتراض",
    slaDueAt: "2026-04-14T12:00:00Z",
    status: "نشط",
    checklist: [
      { id: "CHK-L1", title: "التحقق من المادة النظامية ذات الصلة", done: true },
      { id: "CHK-L2", title: "مراجعة بيانات العقد العمالي", done: false },
    ],
    documentTemplates: [
      { id: "TPL-L1", title: "مذكرة رد عمالية", type: "مذكرة" },
      { id: "TPL-L2", title: "اعتراض على حكم عمالي", type: "اعتراض" },
    ],
    steps: [
      { id: "S-L1", name: "claim intake", completed: true, dueDate: "2026-04-05" },
      { id: "S-L2", name: "مواعيد الاعتراض", completed: false, dueDate: "2026-04-14" },
      { id: "S-L3", name: "جلسات", completed: false },
      { id: "S-L4", name: "تسوية/حكم", completed: false },
    ],
    createdAt: "2026-04-08T09:00:00Z",
  },
  {
    id: "ST-CRM-001",
    tenantId: "demo-tenant",
    caseId: "C-1005",
    caseType: "جزائي",
    stage: "مذكرات الدفاع",
    slaDueAt: "2026-04-12T12:00:00Z",
    status: "متأخر",
    checklist: [
      { id: "CHK-C1", title: "مراجعة محاضر التحقيق", done: true },
      { id: "CHK-C2", title: "اعتماد مذكرة الدفاع من الشريك", done: false },
    ],
    documentTemplates: [
      { id: "TPL-C1", title: "مذكرة دفاع جزائية", type: "مذكرة" },
      { id: "TPL-C2", title: "لائحة استئناف جزائية", type: "لائحة" },
    ],
    steps: [
      { id: "S-C1", name: "تحقيق", completed: true },
      { id: "S-C2", name: "مذكرات الدفاع", completed: false, dueDate: "2026-04-12" },
      { id: "S-C3", name: "جلسات", completed: false },
      { id: "S-C4", name: "حكم واستئناف", completed: false },
    ],
    createdAt: "2026-04-07T09:00:00Z",
  },
];

export const mockPricingModels: PricingModel[] = [
  { id: 'PM-1', type: 'ساعة', rate: 1500, description: 'استشارة قانونية بالساعة - شركاء' },
  { id: 'PM-2', type: 'شهري', retainerAmount: 25000, description: 'عقد مستشار خارجي (Retainer) - خدمات عامة' },
  { id: 'PM-3', type: 'مرحلي', description: 'تمثيل قضائي - دفعات حسب مراحل التقاضي', phases: [
    { name: 'قيد الدعوى', amount: 30000, completionCriteria: 'صدور رقم معاملة من المحكمة التجارية' },
    { name: 'المرافعات', amount: 50000, completionCriteria: 'انتهاء جلسات المرافعة والحجز للحكم' },
    { name: 'صدور الحكم', amount: 20000, completionCriteria: 'استلام نسخة الحكم الابتدائي' }
  ]},
  { id: 'PM-4', type: 'مقطوع', rate: 100000, description: 'تأسيس شركة مساهمة مقفلة - شامل الرسوم' },
];

export const mockKeyAccounts: KeyAccount[] = [
  { 
    id: 'KA-1', 
    clientId: '9', // STC
    accountManagerId: 'U-001', 
    strategicValue: 'High', 
    industry: 'الاتصالات والتقنية', 
    annualTargetRevenue: 2000000, 
    currentPipeValue: 450000,
    growthPlan: 'توسعة الخدمات لتشمل فروع الشركة الإقليمية والملكية الفكرية.'
  },
  { 
    id: 'KA-2', 
    clientId: '7', // Tadawul
    accountManagerId: 'U-002', 
    strategicValue: 'High', 
    industry: 'الخدمات المالية', 
    annualTargetRevenue: 1500000, 
    currentPipeValue: 300000 
  },
];

export const mockProposals: Proposal[] = [
  { 
    id: 'PROP-1', 
    title: 'عرض تقديم خدمات استشارية - التحول لشركة مساهمة', 
    keyAccountId: 'KA-1', 
    status: 'قيد التفاوض', 
    value: 450000, 
    pricingModelId: 'PM-4', 
    validUntil: '2026-06-01', 
    assignedLawyerId: 'U-001', 
    winProbability: 75, 
    tags: ['تحول شركات', 'استشارات'],
    createdAt: '2026-04-01' 
  },
  { 
    id: 'PROP-2', 
    title: 'تمثيل قانوني في منازعة عقارية كبرى', 
    keyAccountId: 'KA-2', 
    status: 'مرسلة', 
    value: 300000, 
    pricingModelId: 'PM-3', 
    validUntil: '2026-05-15', 
    assignedLawyerId: 'U-002', 
    winProbability: 60, 
    tags: ['عقارات', 'تقاضي'],
    createdAt: '2026-04-05' 
  },
  { 
    id: 'PROP-3', 
    title: 'مراجعة عقود الموردين الدولية', 
    status: 'مسودة', 
    value: 120000, 
    pricingModelId: 'PM-2', 
    validUntil: '2026-05-30', 
    assignedLawyerId: 'U-003', 
    winProbability: 40, 
    tags: ['عقود دولية'],
    createdAt: '2026-04-08' 
  },
];

export const mockQAReviews: QAReview[] = [
  {
    id: 'QA-1',
    caseId: 'C-1001',
    reviewerId: 'U-001',
    status: 'Pending',
    checklist: [
      { id: 'QA-CH-1', requirement: 'التحقق من صحة بيانات الوكالة في ناجز', isMet: true },
      { id: 'QA-CH-2', requirement: 'مراجعة المذكرة لغوياً وقانونياً', isMet: false, comment: 'تحتاج مراجعة الأخطاء المطبعية في الصفحة 3' },
      { id: 'QA-CH-3', requirement: 'موافاة العميل بالنسخة النهائية للاعتماد', isMet: true },
    ],
    overallComment: 'المذكرة قوية ولكن تحتاج لتدقيق نهائي.',
  },
];

export const mockKnowledgeAssets: KnowledgeAsset[] = [
  {
    id: 'KA-101',
    title: 'دليل الإجراءات أمام المحكمة التجارية',
    category: 'Procedure',
    tags: ['تجاري', 'إجراءات'],
    contentUrl: '/docs/commercial-procedures.pdf',
    version: 1,
    authorId: 'U-001',
    isVerified: true,
    verifiedBy: 'U-001',
    createdAt: '2025-10-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'KA-102',
    title: 'بحث: المسؤولية التقصيرية في عقود المقاولات',
    category: 'Research',
    tags: ['عقود', 'مقاولات'],
    contentUrl: '/docs/tort-liability.pdf',
    version: 2,
    authorId: 'U-002',
    isVerified: false,
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01',
  },
];

export const mockTrainingPathways: TrainingPathway[] = [
  {
    id: 'TP-1',
    userId: 'U-003', // فهد العتيبي (متدرب)
    title: 'مسار تأهيل المرافعات التجارية',
    description: 'دورة مكثفة حول إجراءات التقاضي في المحاكم التجارية والعمالية.',
    modules: [
      { id: 'M1', title: 'مقدمة في نظام المحاكم التجارية الجديد', status: 'Completed', score: 95, completedAt: '2026-02-10' },
      { id: 'M2', title: 'صياغة المذكرات الاعتراضية', status: 'InProgress' },
      { id: 'M3', title: 'فنون الترافع والارتجال القضائي', status: 'NotStarted' },
    ],
    mentorId: 'U-001',
    overallProgress: 45,
    startDate: '2026-01-01',
  },
];

export const mockAssessments: KSAAssessment[] = [
  {
    id: 'ASM-1',
    pathwayId: 'TP-1',
    title: 'تقييم وحدة صياغة المذكرات',
    questions: [
      { id: 'Q1', text: 'ما هي مدة الاعتراض على الأحكام التجارية؟', options: ['15 يوم', '30 يوم', '60 يوم'], correctOption: 1 },
      { id: 'Q2', text: 'هل يجوز تقديم بينة جديدة أمام الاستئناف؟', options: ['نعم مطلقاً', 'لا يجوز', 'نعم بضوابط محددة'], correctOption: 2 },
    ],
    passingScore: 70,
  },
];

export const mockConflictRecords: ConflictCheckRecord[] = [
  {
    id: 'CCR-1',
    query: 'شركة تداول العقبارية',
    checkedAt: '2026-04-01T10:00:00Z',
    checkedBy: 'U-001',
    status: 'IndirectConflict',
    matches: [
      {
        entityName: 'شركة تداول السعودية',
        relationshipType: 'Subsidiary',
        relatedToId: 'CL-101',
        description: 'تبعاً لشركة تداول السعودية (عميل نشط)',
        severity: 'High',
      }
    ],
    resolutionNotes: 'يجرى التنسيق مع الشريك المسؤول لفحص طبيعة التعامل.',
  }
];
