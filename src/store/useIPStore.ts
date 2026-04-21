import { create } from 'zustand';
import { IPFiling, IPRenewal, IPOpposition, IPEnforcementAction, IPRecord } from '../types';


interface IPState {
  ipFilings: IPFiling[];
  ipRenewals: IPRenewal[];
  ipOppositions: IPOpposition[];
  ipEnforcementActions: IPEnforcementAction[];
  ipRecords: IPRecord[];

  setIPFilings: (filings: IPFiling[]) => void;
  setIPRenewals: (renewals: IPRenewal[]) => void;
  setIPOppositions: (oppositions: IPOpposition[]) => void;
  setIPEnforcementActions: (actions: IPEnforcementAction[]) => void;
  setIPRecords: (records: IPRecord[]) => void;

  updateIPRenewalStatus: (id: string, status: IPRenewal['status']) => void;
  updateIPOppositionStatus: (id: string, status: IPOpposition['status']) => void;
  updateIPEnforcementStatus: (id: string, status: IPEnforcementAction['status']) => void;
}

export const useIPStore = create<IPState>((set) => ({
  ipFilings: [],
  ipRenewals: [],
  ipOppositions: [],
  ipEnforcementActions: [],
  ipRecords: [],

  setIPFilings: (ipFilings) => set({ ipFilings }),
  setIPRenewals: (ipRenewals) => set({ ipRenewals }),
  setIPOppositions: (ipOppositions) => set({ ipOppositions }),
  setIPEnforcementActions: (ipEnforcementActions) => set({ ipEnforcementActions }),
  setIPRecords: (ipRecords) => set({ ipRecords }),

  updateIPRenewalStatus: (id, status) => set((state) => ({
    ipRenewals: state.ipRenewals.map((r) => (r.id === id ? { ...r, status, paid: status === 'مكتمل' ? true : r.paid } : r)),
  })),
  updateIPOppositionStatus: (id, status) => set((state) => ({
    ipOppositions: state.ipOppositions.map((o) => (o.id === id ? { ...o, status } : o)),
  })),
  updateIPEnforcementStatus: (id, status) => set((state) => ({
    ipEnforcementActions: state.ipEnforcementActions.map((a) => (a.id === id ? { ...a, status } : a)),
  })),
}));
