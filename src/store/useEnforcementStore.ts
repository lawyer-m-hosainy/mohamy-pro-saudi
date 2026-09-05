import { create } from 'zustand';
import { EnforcementCase } from '../types';
import type { Case } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const enforcementCrud = createTenantCrud<EnforcementCase>('enforcement_cases');

/**
 * Generates a sequential enforcement file number.
 * Format: ENF-YYYY-NNNN (e.g. ENF-2026-0001)
 */
function generateFileNumber(existingCases: EnforcementCase[]): string {
  const year = new Date().getFullYear();
  const prefix = `ENF-${year}-`;

  // Find the highest number for this year
  let maxNum = 0;
  existingCases.forEach((ec) => {
    if (ec.fileNumber?.startsWith(prefix)) {
      const num = parseInt(ec.fileNumber.replace(prefix, ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });

  return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
}

interface EnforcementState {
  enforcementCases: EnforcementCase[];
  loadEnforcementCases: () => Promise<void>;
  setEnforcementCases: (cases: EnforcementCase[]) => void;
  addEnforcementCase: (newCase: EnforcementCase) => void;
  addEnforcementAction: (caseId: string, action: EnforcementCase['actions'][number]) => void;

  /** إنشاء ملف تنفيذ تلقائي من قضية مكتب */
  createEnforcementFromCase: (
    caseData: Case,
    clientName: string,
    amountClaimed: number,
    executionType: EnforcementCase['executionType'],
    judgmentNumber?: string,
    judgmentDate?: string,
  ) => EnforcementCase;

  /** إنشاء ملف تنفيذ يدوي من حكم خارجي */
  createEnforcementManual: (data: {
    clientId?: string;
    clientName: string;
    debtorName: string;
    amountClaimed: number;
    executionType: EnforcementCase['executionType'];
    judgmentNumber?: string;
    judgmentDate?: string;
    judgmentCourt?: string;
  }) => EnforcementCase;

  /** الحصول على رقم الملف التالي */
  getNextFileNumber: () => string;
}

export const useEnforcementStore = create<EnforcementState>((set, get) => ({
  enforcementCases: [],

  loadEnforcementCases: async () => {
    const enforcementCases = await enforcementCrud.fetchAll();
    set({ enforcementCases });
  },

  setEnforcementCases: (enforcementCases) => set({ enforcementCases }),

  addEnforcementCase: (newCase) => {
    set((state) => ({ enforcementCases: [newCase, ...state.enforcementCases] }));
    void enforcementCrud.save(newCase, false);
  },

  addEnforcementAction: (enforcementCaseId, action) => {
    set((state) => ({
      enforcementCases: state.enforcementCases.map((ec) =>
        ec.id === enforcementCaseId ? { ...ec, actions: [...ec.actions, action] } : ec
      ),
    }));
    const updated = get().enforcementCases.find((ec) => ec.id === enforcementCaseId);
    if (updated) void enforcementCrud.save(updated, true);
  },

  getNextFileNumber: () => {
    return generateFileNumber(get().enforcementCases);
  },

  createEnforcementFromCase: (caseData, clientName, amountClaimed, executionType, judgmentNumber, judgmentDate) => {
    const state = get();
    const fileNumber = generateFileNumber(state.enforcementCases);
    const id = crypto.randomUUID();

    const newCase: EnforcementCase = {
      id,
      fileNumber,
      source: 'قضية_مكتب',
      caseId: caseData.id,
      clientId: caseData.clientId,
      clientName,
      debtorName: caseData.defendant,
      amountClaimed,
      amountCollected: 0,
      status: 'مفتوح',
      executionType,
      judgmentNumber,
      judgmentDate,
      judgmentCourt: caseData.court,
      linkedCaseId: caseData.id,
      linkedCaseRef: `${caseData.id} - ${caseData.court}`,
      createdAt: new Date().toISOString(),
      actions: [{
        id: crypto.randomUUID(),
        enforcementCaseId: id,
        title: 'فتح ملف تنفيذ من قضية المكتب',
        date: new Date().toISOString(),
        performedBy: 'النظام',
        type: 'إجراء نظامي',
      }],
      orders: [],
      assets: [],
    };

    set((s) => ({ enforcementCases: [newCase, ...s.enforcementCases] }));
    void enforcementCrud.save(newCase, false);
    return newCase;
  },

  createEnforcementManual: (data) => {
    const state = get();
    const fileNumber = generateFileNumber(state.enforcementCases);
    const id = crypto.randomUUID();

    const newCase: EnforcementCase = {
      id,
      fileNumber,
      source: 'حكم_خارجي',
      clientId: data.clientId,
      clientName: data.clientName,
      debtorName: data.debtorName,
      amountClaimed: data.amountClaimed,
      amountCollected: 0,
      status: 'مفتوح',
      executionType: data.executionType,
      judgmentNumber: data.judgmentNumber,
      judgmentDate: data.judgmentDate,
      judgmentCourt: data.judgmentCourt,
      createdAt: new Date().toISOString(),
      actions: [{
        id: crypto.randomUUID(),
        enforcementCaseId: id,
        title: 'فتح ملف تنفيذ من حكم خارجي',
        date: new Date().toISOString(),
        performedBy: 'النظام',
        type: 'إجراء نظامي',
      }],
      orders: [],
      assets: [],
    };

    set((s) => ({ enforcementCases: [newCase, ...s.enforcementCases] }));
    void enforcementCrud.save(newCase, false);
    return newCase;
  },
}));
