import { create } from 'zustand';
import { EnforcementCase } from '../types';


interface EnforcementState {
  enforcementCases: EnforcementCase[];
  setEnforcementCases: (cases: EnforcementCase[]) => void;
  addEnforcementCase: (newCase: EnforcementCase) => void;
  addEnforcementAction: (caseId: string, action: EnforcementCase['actions'][number]) => void;
}

const MOCK_ENFORCEMENT_CASES: EnforcementCase[] = [
  {
    id: "ENF-827391",
    caseId: "C-152468",
    clientId: "C-177617",
    clientName: "شركة العزم للمقاولات",
    debtorName: "مؤسسة القمة للتجارة",
    amountClaimed: 150000,
    amountCollected: 0,
    status: "تحت إجراء 46",
    stageDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    actions: [
      {
        id: "ACT-1",
        enforcementCaseId: "ENF-827391",
        title: "إصدار قرار 34",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        performedBy: "النظام",
        type: "إجراء نظامي"
      }
    ],
    orders: [
      {
        id: "ORD-1",
        enforcementCaseId: "ENF-827391",
        type: "إشعار 46",
        issuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: "46-2023-9912",
        status: "نشط"
      }
    ],
    assets: []
  },
  {
    id: "ENF-443219",
    caseId: "C-998822",
    clientId: "C-334411",
    clientName: "أحمد عبدالله العقاري",
    debtorName: "شركة الأفق للتقنية",
    amountClaimed: 500000,
    amountCollected: 200000,
    status: "حجز/منع",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    actions: [
      {
        id: "ACT-2",
        enforcementCaseId: "ENF-443219",
        title: "تحصيل جزئي للمبلغ",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        performedBy: "محاسب المكتب",
        type: "تحصيل",
        notes: "تم تحصيل الدفعة الأولى من المزاد"
      }
    ],
    orders: [
      {
        id: "ORD-2",
        enforcementCaseId: "ENF-443219",
        type: "أمر حجز",
        issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: "ORD-H-992",
        status: "منفذ"
      },
      {
        id: "ORD-3",
        enforcementCaseId: "ENF-443219",
        type: "منع سفر",
        issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: "ORD-M-112",
        status: "نشط"
      }
    ],
    assets: [
      {
        id: "AST-1",
        enforcementCaseId: "ENF-443219",
        type: "حساب بنكي",
        description: "مصرف الراجحي - تجميد رصيد",
        estimatedValue: 150000,
        isFrozen: true
      }
    ]
  }
];

export const useEnforcementStore = create<EnforcementState>((set) => ({
  enforcementCases: MOCK_ENFORCEMENT_CASES,

  setEnforcementCases: (enforcementCases) => set({ enforcementCases }),
  addEnforcementCase: (newCase) => set((state) => ({ 
    enforcementCases: [newCase, ...state.enforcementCases] 
  })),
  addEnforcementAction: (enforcementCaseId, action) => set((state) => ({
    enforcementCases: state.enforcementCases.map((ec) =>
      ec.id === enforcementCaseId ? { ...ec, actions: [...ec.actions, action] } : ec
    ),
  })),
}));
