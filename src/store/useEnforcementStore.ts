import { create } from 'zustand';
import { EnforcementCase } from '../types';


interface EnforcementState {
  enforcementCases: EnforcementCase[];
  setEnforcementCases: (cases: EnforcementCase[]) => void;
  addEnforcementAction: (caseId: string, action: EnforcementCase['actions'][number]) => void;
}

export const useEnforcementStore = create<EnforcementState>((set) => ({
  enforcementCases: [],

  setEnforcementCases: (enforcementCases) => set({ enforcementCases }),
  addEnforcementAction: (enforcementCaseId, action) => set((state) => ({
    enforcementCases: state.enforcementCases.map((ec) =>
      ec.id === enforcementCaseId ? { ...ec, actions: [...ec.actions, action] } : ec
    ),
  })),
}));
