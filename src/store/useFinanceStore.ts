import { create } from 'zustand';
import { Expense, TimeEntry, ReceivableAccount, TrustAccount, PricingModel } from '../types';


interface FinanceState {
  expenses: Expense[];
  timeEntries: TimeEntry[];
  receivables: ReceivableAccount[];
  trustAccounts: TrustAccount[];
  pricingModels: PricingModel[];
  
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;
  setReceivables: (receivables: ReceivableAccount[]) => void;
  addCollectionAction: (receivableId: string, action: ReceivableAccount['actions'][number]) => void;
  reconcileReceivable: (receivableId: string) => void;
  closeReceivable: (receivableId: string) => void;
  setTrustAccounts: (accounts: TrustAccount[]) => void;
  addTrustAccount: (account: TrustAccount) => void;
  disburseTrustAccount: (accountId: string) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  toggleTimeEntryBilledStatus: (id: string) => void;
  setPricingModels: (models: PricingModel[]) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  expenses: [],
  timeEntries: [],
  receivables: [
    {
      id: "REC-99120",
      clientId: "C-177617",
      clientName: "شركة العزم للمقاولات",
      caseId: "C-152468",
      totalAmount: 25000,
      collectedAmount: 0,
      outstandingAmount: 25000,
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: "متأخر",
      isReconciled: false,
      actions: []
    },
    {
      id: "REC-44321",
      clientId: "C-334411",
      clientName: "أحمد عبدالله العقاري",
      caseId: "C-998822",
      totalAmount: 200000,
      collectedAmount: 80000,
      outstandingAmount: 120000,
      dueDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      status: "متأخر",
      isReconciled: false,
      actions: [
        {
          id: "CA-1",
          receivableId: "REC-44321",
          type: "إنذار قانوني",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "النظام",
          notes: "تم إرسال إنذار قانوني نهائي قبل الرفع لمحكمة التنفيذ"
        }
      ]
    },
    {
      id: "REC-11223",
      clientId: "C-556677",
      clientName: "مؤسسة الرواد المحدودة",
      caseId: "C-112233",
      totalAmount: 15000,
      collectedAmount: 0,
      outstandingAmount: 15000,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "مفتوح",
      isReconciled: false,
      actions: []
    }
  ],
  trustAccounts: [],
  pricingModels: [],

  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  setTimeEntries: (timeEntries) => set({ timeEntries }),
  setReceivables: (receivables) => set({ receivables }),
  
  addCollectionAction: (receivableId, action) => set((state) => ({
    receivables: state.receivables.map((r) =>
      r.id === receivableId ? { ...r, actions: [...r.actions, action] } : r
    ),
  })),
  reconcileReceivable: (receivableId) => set((state) => ({
    receivables: state.receivables.map((r) =>
      r.id === receivableId ? { ...r, isReconciled: true } : r
    ),
  })),
  closeReceivable: (receivableId) => set((state) => ({
    receivables: state.receivables.map((r) => {
      if (r.id !== receivableId) return r;
      if (!r.isReconciled) return r;
      return { ...r, status: "مغلق" };
    }),
  })),
  
  setTrustAccounts: (trustAccounts) => set({ trustAccounts }),
  addTrustAccount: (account) =>
    set((state) => ({ trustAccounts: [account, ...state.trustAccounts] })),
  disburseTrustAccount: (accountId) => set((state) => ({
    trustAccounts: state.trustAccounts.map((a) =>
      a.id === accountId ? { ...a, status: "تم الصرف" } : a
    ),
  })),
  addTimeEntry: (entry) =>
    set((state) => ({ timeEntries: [entry, ...state.timeEntries] })),
  updateTimeEntry: (id, updates) => set((state) => ({
    timeEntries: state.timeEntries.map((te) => 
      te.id === id ? { ...te, ...updates } : te
    )
  })),
  deleteTimeEntry: (id) => set((state) => ({
    timeEntries: state.timeEntries.filter((te) => te.id !== id)
  })),
  toggleTimeEntryBilledStatus: (id) => set((state) => ({
    timeEntries: state.timeEntries.map((te) =>
      te.id === id ? { ...te, isBilled: !te.isBilled } : te
    )
  })),
  setPricingModels: (pricingModels) => set({ pricingModels }),
}));
