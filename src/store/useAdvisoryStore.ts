import { create } from 'zustand';
import { AdvisoryRequest } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const advisoryCrud = createTenantCrud<AdvisoryRequest>('advisory_requests');

interface AdvisoryState {
  advisoryRequests: AdvisoryRequest[];
  loadAdvisoryData: () => Promise<void>;
  setAdvisoryRequests: (requests: AdvisoryRequest[]) => void;
  addAdvisoryOpinion: (requestId: string, opinion: AdvisoryRequest['opinions'][number]) => void;
  updateAdvisoryStatus: (requestId: string, status: AdvisoryRequest['status']) => void;
  decideAdvisoryApproval: (requestId: string, approvalId: string, status: 'معتمد' | 'مرفوض', notes?: string) => void;
}

export const useAdvisoryStore = create<AdvisoryState>((set, get) => ({
  advisoryRequests: [],

  loadAdvisoryData: async () => {
    const advisoryRequests = await advisoryCrud.fetchAll();
    set({ advisoryRequests });
  },

  setAdvisoryRequests: (advisoryRequests) => set({ advisoryRequests }),

  addAdvisoryOpinion: (requestId, opinion) => {
    set((state) => ({
      advisoryRequests: state.advisoryRequests.map((r) =>
        r.id === requestId ? { ...r, opinions: [...r.opinions, opinion] } : r
      ),
    }));
    const updated = get().advisoryRequests.find((r) => r.id === requestId);
    if (updated) void advisoryCrud.save(updated, true);
  },

  updateAdvisoryStatus: (requestId, status) => {
    set((state) => ({
      advisoryRequests: state.advisoryRequests.map((r) =>
        r.id === requestId ? { ...r, status, closedAt: status === 'مغلق' ? new Date().toISOString() : r.closedAt } : r
      ),
    }));
    const updated = get().advisoryRequests.find((r) => r.id === requestId);
    if (updated) void advisoryCrud.save(updated, true);
  },

  decideAdvisoryApproval: (requestId, approvalId, status, notes) => {
    set((state) => ({
      advisoryRequests: state.advisoryRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              approvals: r.approvals.map((a) =>
                a.id === approvalId ? { ...a, status, notes, decidedAt: new Date().toISOString() } : a
              ),
            }
          : r
      ),
    }));
    const updated = get().advisoryRequests.find((r) => r.id === requestId);
    if (updated) void advisoryCrud.save(updated, true);
  },
}));
