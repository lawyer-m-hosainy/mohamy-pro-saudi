import { create } from 'zustand';
import { IPFiling, IPRenewal, IPOpposition, IPEnforcementAction, IPRecord } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const recordsCrud = createTenantCrud<IPRecord>('ip_records');
const filingsCrud = createTenantCrud<IPFiling>('ip_filings');
const renewalsCrud = createTenantCrud<IPRenewal>('ip_renewals');
const oppositionsCrud = createTenantCrud<IPOpposition>('ip_oppositions');
const enforcementCrud = createTenantCrud<IPEnforcementAction>('ip_enforcement_actions');

interface IPState {
  ipFilings: IPFiling[];
  ipRenewals: IPRenewal[];
  ipOppositions: IPOpposition[];
  ipEnforcementActions: IPEnforcementAction[];
  ipRecords: IPRecord[];

  loadIPData: () => Promise<void>;

  setIPFilings: (filings: IPFiling[]) => void;
  addIPFiling: (filing: IPFiling) => void;
  setIPRenewals: (renewals: IPRenewal[]) => void;
  setIPOppositions: (oppositions: IPOpposition[]) => void;
  setIPEnforcementActions: (actions: IPEnforcementAction[]) => void;
  setIPRecords: (records: IPRecord[]) => void;
  addIPRecord: (record: IPRecord) => void;
  renewIPRecord: (id: string) => void;

  updateIPRenewalStatus: (id: string, status: IPRenewal['status']) => void;
  updateIPOppositionStatus: (id: string, status: IPOpposition['status']) => void;
  updateIPEnforcementStatus: (id: string, status: IPEnforcementAction['status']) => void;
}

export const useIPStore = create<IPState>((set, get) => ({
  ipFilings: [],
  ipRenewals: [],
  ipOppositions: [],
  ipEnforcementActions: [],
  ipRecords: [],

  loadIPData: async () => {
    const [ipRecords, ipFilings, ipRenewals, ipOppositions, ipEnforcementActions] = await Promise.all([
      recordsCrud.fetchAll(),
      filingsCrud.fetchAll(),
      renewalsCrud.fetchAll(),
      oppositionsCrud.fetchAll(),
      enforcementCrud.fetchAll(),
    ]);
    set({ ipRecords, ipFilings, ipRenewals, ipOppositions, ipEnforcementActions });
  },

  setIPFilings: (ipFilings) => set({ ipFilings }),
  addIPFiling: (filing) => {
    set((state) => ({ ipFilings: [filing, ...state.ipFilings] }));
    void filingsCrud.save(filing, false);
  },
  setIPRenewals: (ipRenewals) => set({ ipRenewals }),
  setIPOppositions: (ipOppositions) => set({ ipOppositions }),
  setIPEnforcementActions: (ipEnforcementActions) => set({ ipEnforcementActions }),
  setIPRecords: (ipRecords) => set({ ipRecords }),
  addIPRecord: (record) => {
    set((state) => ({ ipRecords: [...state.ipRecords, record] }));
    void recordsCrud.save(record, false);
  },
  renewIPRecord: (id) => {
    set((state) => ({
      ipRecords: state.ipRecords.map((r) =>
        r.id === id ? { ...r, status: 'مسجلة' as const, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } : r
      ),
    }));
    const updated = get().ipRecords.find((r) => r.id === id);
    if (updated) void recordsCrud.save(updated, true);
  },

  updateIPRenewalStatus: (id, status) => {
    set((state) => ({
      ipRenewals: state.ipRenewals.map((r) => (r.id === id ? { ...r, status, paid: status === 'مكتمل' ? true : r.paid } : r)),
    }));
    const updated = get().ipRenewals.find((r) => r.id === id);
    if (updated) void renewalsCrud.save(updated, true);
  },
  updateIPOppositionStatus: (id, status) => {
    set((state) => ({
      ipOppositions: state.ipOppositions.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    const updated = get().ipOppositions.find((o) => o.id === id);
    if (updated) void oppositionsCrud.save(updated, true);
  },
  updateIPEnforcementStatus: (id, status) => {
    set((state) => ({
      ipEnforcementActions: state.ipEnforcementActions.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
    const updated = get().ipEnforcementActions.find((a) => a.id === id);
    if (updated) void enforcementCrud.save(updated, true);
  },
}));
