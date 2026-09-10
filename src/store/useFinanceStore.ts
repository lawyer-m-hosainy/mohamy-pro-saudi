import { create } from 'zustand';
import { Expense, TimeEntry, ReceivableAccount, TrustAccount, PricingModel } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const expensesCrud = createTenantCrud<Expense>('expenses');
const timeEntriesCrud = createTenantCrud<TimeEntry>('time_entries');
const trustAccountsCrud = createTenantCrud<TrustAccount>('trust_accounts');
const receivablesCrud = createTenantCrud<ReceivableAccount>('receivable_accounts');
const pricingModelsCrud = createTenantCrud<PricingModel>('pricing_models');

interface FinanceState {
  expenses: Expense[];
  timeEntries: TimeEntry[];
  receivables: ReceivableAccount[];
  trustAccounts: TrustAccount[];
  pricingModels: PricingModel[];

  loadFinanceData: () => Promise<void>;

  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;
  setReceivables: (receivables: ReceivableAccount[]) => void;
  addReceivable: (receivable: ReceivableAccount) => void;
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

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  timeEntries: [],
  receivables: [],
  trustAccounts: [],
  pricingModels: [],

  loadFinanceData: async () => {
    const [expenses, timeEntries, trustAccounts, receivables, pricingModels] = await Promise.all([
      expensesCrud.fetchAll(),
      timeEntriesCrud.fetchAll(),
      trustAccountsCrud.fetchAll(),
      receivablesCrud.fetchAll(),
      pricingModelsCrud.fetchAll(),
    ]);
    set({ expenses, timeEntries, trustAccounts, receivables, pricingModels });
  },

  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => {
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    void expensesCrud.save(expense, false);
  },
  setTimeEntries: (timeEntries) => set({ timeEntries }),
  setReceivables: (receivables) => set({ receivables }),
  addReceivable: (receivable) => {
    set((state) => ({ receivables: [receivable, ...state.receivables] }));
    void receivablesCrud.save(receivable, false);
  },

  addCollectionAction: (receivableId, action) => {
    set((state) => ({
      receivables: state.receivables.map((r) =>
        r.id === receivableId ? { ...r, actions: [...r.actions, action] } : r
      ),
    }));
    const updated = get().receivables.find((r) => r.id === receivableId);
    if (updated) void receivablesCrud.save(updated, true);
  },
  reconcileReceivable: (receivableId) => {
    set((state) => ({
      receivables: state.receivables.map((r) =>
        r.id === receivableId ? { ...r, isReconciled: true } : r
      ),
    }));
    const updated = get().receivables.find((r) => r.id === receivableId);
    if (updated) void receivablesCrud.save(updated, true);
  },
  closeReceivable: (receivableId) => {
    set((state) => ({
      receivables: state.receivables.map((r) => {
        if (r.id !== receivableId) return r;
        if (!r.isReconciled) return r;
        return { ...r, status: "مغلق" };
      }),
    }));
    const updated = get().receivables.find((r) => r.id === receivableId);
    if (updated) void receivablesCrud.save(updated, true);
  },

  setTrustAccounts: (trustAccounts) => set({ trustAccounts }),
  addTrustAccount: (account) => {
    set((state) => ({ trustAccounts: [account, ...state.trustAccounts] }));
    void trustAccountsCrud.save(account, false);
  },
  disburseTrustAccount: (accountId) => {
    set((state) => ({
      trustAccounts: state.trustAccounts.map((a) =>
        a.id === accountId ? { ...a, status: "تم الصرف" } : a
      ),
    }));
    const updated = get().trustAccounts.find((a) => a.id === accountId);
    if (updated) void trustAccountsCrud.save(updated, true);
  },
  addTimeEntry: (entry) => {
    set((state) => ({ timeEntries: [entry, ...state.timeEntries] }));
    void timeEntriesCrud.save(entry, false);
  },
  updateTimeEntry: (id, updates) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((te) =>
        te.id === id ? { ...te, ...updates } : te
      )
    }));
    const updated = get().timeEntries.find((te) => te.id === id);
    if (updated) void timeEntriesCrud.save(updated, true);
  },
  deleteTimeEntry: (id) => {
    set((state) => ({
      timeEntries: state.timeEntries.filter((te) => te.id !== id)
    }));
    void timeEntriesCrud.remove(id);
  },
  toggleTimeEntryBilledStatus: (id) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((te) =>
        te.id === id ? { ...te, isBilled: !te.isBilled } : te
      )
    }));
    const updated = get().timeEntries.find((te) => te.id === id);
    if (updated) void timeEntriesCrud.save(updated, true);
  },
  setPricingModels: (pricingModels) => set({ pricingModels }),
}));
