import { create } from 'zustand';
import { ContractRequest, ContractTemplate } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const requestsCrud = createTenantCrud<ContractRequest>('contract_requests');
const templatesCrud = createTenantCrud<ContractTemplate>('contract_templates');

interface CLMState {
  contractRequests: ContractRequest[];
  contracts: ContractTemplate[];
  loadCLMData: () => Promise<void>;
  setContractRequests: (requests: ContractRequest[]) => void;
  addContractRequest: (request: ContractRequest) => void;
  setContracts: (contracts: ContractTemplate[]) => void;
  addContractTemplate: (template: ContractTemplate) => void;
  addContractVersion: (requestId: string, version: ContractRequest['versions'][number]) => void;
  updateContractStage: (requestId: string, stage: ContractRequest['stage']) => void;
  decideContractApproval: (requestId: string, approvalId: string, status: 'معتمد' | 'مرفوض', notes?: string) => void;
  updateContractObligationStatus: (requestId: string, obligationId: string, status: 'قادم' | 'مكتمل' | 'متأخر') => void;
}

export const useCLMStore = create<CLMState>((set, get) => ({
  contractRequests: [],
  contracts: [],

  loadCLMData: async () => {
    const [contractRequests, contracts] = await Promise.all([
      requestsCrud.fetchAll(),
      templatesCrud.fetchAll(),
    ]);
    set({ contractRequests, contracts });
  },

  setContractRequests: (contractRequests) => set({ contractRequests }),
  addContractRequest: (request) => {
    set((state) => ({ contractRequests: [request, ...state.contractRequests] }));
    void requestsCrud.save(request, false);
  },
  setContracts: (contracts) => set({ contracts }),
  addContractTemplate: (template) => {
    set((state) => ({ contracts: [template, ...state.contracts] }));
    void templatesCrud.save(template, false);
  },

  addContractVersion: (requestId, version) => {
    set((state) => ({
      contractRequests: state.contractRequests.map((r) =>
        r.id === requestId ? { ...r, versions: [...r.versions, version] } : r
      ),
    }));
    const updated = get().contractRequests.find((r) => r.id === requestId);
    if (updated) void requestsCrud.save(updated, true);
  },

  updateContractStage: (requestId, stage) => {
    set((state) => ({
      contractRequests: state.contractRequests.map((r) =>
        r.id === requestId ? { ...r, stage } : r
      ),
    }));
    const updated = get().contractRequests.find((r) => r.id === requestId);
    if (updated) void requestsCrud.save(updated, true);
  },

  decideContractApproval: (requestId, approvalId, status, notes) => {
    set((state) => ({
      contractRequests: state.contractRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              approvals: r.approvals.map((a) =>
                a.id === approvalId ? { ...a, status, notes, decidedAt: new Date().toISOString() } : a
              ),
              status: status === 'معتمد' ? 'معتمد' : r.status,
            }
          : r
      ),
    }));
    const updated = get().contractRequests.find((r) => r.id === requestId);
    if (updated) void requestsCrud.save(updated, true);
  },

  updateContractObligationStatus: (requestId, obligationId, status) => {
    set((state) => ({
      contractRequests: state.contractRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              obligations: r.obligations.map((o) => (o.id === obligationId ? { ...o, status } : o)),
            }
          : r
      ),
    }));
    const updated = get().contractRequests.find((r) => r.id === requestId);
    if (updated) void requestsCrud.save(updated, true);
  },
}));
