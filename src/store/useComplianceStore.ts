import { create } from 'zustand';
import {
  RiskRegister, Control, ComplianceIssue, RegulatoryObligation,
  ComplianceRecord, LegalPrecedent, QAReview, ConflictCheckRecord,
  KnowledgeAsset, SpecializedTrack, TrainingPathway, KSAAssessment
} from '../types';
import { createTenantCrud } from '../services/genericCrud';

const riskCrud = createTenantCrud<RiskRegister>('risk_registers');
const controlsCrud = createTenantCrud<Control>('controls');
const issuesCrud = createTenantCrud<ComplianceIssue>('compliance_issues');
const obligationsCrud = createTenantCrud<RegulatoryObligation>('regulatory_obligations');
const complianceCrud = createTenantCrud<ComplianceRecord>('compliance_records');
const precedentsCrud = createTenantCrud<LegalPrecedent>('legal_precedents');
const qaReviewsCrud = createTenantCrud<QAReview>('qa_reviews');
const conflictCrud = createTenantCrud<ConflictCheckRecord>('conflict_check_records');
const knowledgeCrud = createTenantCrud<KnowledgeAsset>('knowledge_assets');
const tracksCrud = createTenantCrud<SpecializedTrack>('specialized_tracks');
const pathwaysCrud = createTenantCrud<TrainingPathway>('training_pathways');
const assessmentsCrud = createTenantCrud<KSAAssessment>('ksa_assessments');

interface ComplianceState {
  riskRegisters: RiskRegister[];
  controls: Control[];
  complianceIssues: ComplianceIssue[];
  regulatoryObligations: RegulatoryObligation[];
  compliance: ComplianceRecord[];
  precedents: LegalPrecedent[];
  qaReviews: QAReview[];
  conflictHistory: ConflictCheckRecord[];
  knowledgeAssets: KnowledgeAsset[];
  specializedTracks: SpecializedTrack[];
  trainingPathways: TrainingPathway[];
  assessments: KSAAssessment[];

  loadComplianceData: () => Promise<void>;

  setRiskRegisters: (registers: RiskRegister[]) => void;
  setControls: (controls: Control[]) => void;
  setComplianceIssues: (issues: ComplianceIssue[]) => void;
  setRegulatoryObligations: (obligations: RegulatoryObligation[]) => void;
  setCompliance: (compliance: ComplianceRecord[]) => void;
  addComplianceRecord: (record: ComplianceRecord) => void;
  updateComplianceRecord: (id: string, updates: Partial<ComplianceRecord>) => void;
  removeComplianceRecord: (id: string) => void;
  setPrecedents: (precedents: LegalPrecedent[]) => void;
  setQAReviews: (reviews: QAReview[]) => void;
  addQAReview: (review: QAReview) => void;
  addPrecedent: (precedent: LegalPrecedent) => void;
  addConflictRecord: (record: ConflictCheckRecord) => void;
  setKnowledgeAssets: (assets: KnowledgeAsset[]) => void;
  addKnowledgeAsset: (asset: KnowledgeAsset) => void;
  setSpecializedTracks: (tracks: SpecializedTrack[]) => void;
  addSpecializedTrack: (track: SpecializedTrack) => void;
  setTrainingPathways: (pathways: TrainingPathway[]) => void;
  setAssessments: (assessments: KSAAssessment[]) => void;

  updateRiskStatus: (id: string, status: RiskRegister['status']) => void;
  updateComplianceIssueStatus: (id: string, status: ComplianceIssue['status']) => void;
  updateQAChecklist: (reviewId: string, itemId: string, isMet: boolean) => void;
  updateQAStatus: (reviewId: string, status: QAReview['status']) => void;
  toggleSpecializedChecklist: (trackId: string, checklistId: string) => void;
  updateSpecializedTrackStatus: (trackId: string, status: SpecializedTrack['status']) => void;
  updateTrainingModuleStatus: (pathwayId: string, moduleId: string, status: TrainingPathway['modules'][number]['status']) => void;
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
  riskRegisters: [],
  controls: [],
  complianceIssues: [],
  regulatoryObligations: [],
  compliance: [],
  precedents: [],
  qaReviews: [],
  conflictHistory: [],
  knowledgeAssets: [],
  specializedTracks: [],
  trainingPathways: [],
  assessments: [],

  loadComplianceData: async () => {
    const [
      riskRegisters, controls, complianceIssues, regulatoryObligations,
      compliance, precedents, qaReviews, conflictHistory,
      knowledgeAssets, specializedTracks, trainingPathways, assessments,
    ] = await Promise.all([
      riskCrud.fetchAll(), controlsCrud.fetchAll(), issuesCrud.fetchAll(), obligationsCrud.fetchAll(),
      complianceCrud.fetchAll(), precedentsCrud.fetchAll(), qaReviewsCrud.fetchAll(), conflictCrud.fetchAll(),
      knowledgeCrud.fetchAll(), tracksCrud.fetchAll(), pathwaysCrud.fetchAll(), assessmentsCrud.fetchAll(),
    ]);
    set({
      riskRegisters, controls, complianceIssues, regulatoryObligations,
      compliance, precedents, qaReviews, conflictHistory,
      knowledgeAssets, specializedTracks, trainingPathways, assessments,
    });
  },

  setRiskRegisters: (riskRegisters) => set({ riskRegisters }),
  setControls: (controls) => set({ controls }),
  setComplianceIssues: (complianceIssues) => set({ complianceIssues }),
  setRegulatoryObligations: (regulatoryObligations) => set({ regulatoryObligations }),
  setCompliance: (compliance) => set({ compliance }),
  addComplianceRecord: (record) => {
    set((state) => ({ compliance: [record, ...state.compliance] }));
    void complianceCrud.save(record, false);
  },
  updateComplianceRecord: (id, updates) => {
    set((state) => ({
      compliance: state.compliance.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
    const updated = get().compliance.find(r => r.id === id);
    if (updated) void complianceCrud.save(updated, true);
  },
  removeComplianceRecord: (id) => {
    set((state) => ({
      compliance: state.compliance.filter(r => r.id !== id)
    }));
    void complianceCrud.remove(id);
  },
  setPrecedents: (precedents) => set({ precedents }),
  setQAReviews: (qaReviews) => set({ qaReviews }),
  addQAReview: (review) => {
    set((state) => ({ qaReviews: [review, ...state.qaReviews] }));
    void qaReviewsCrud.save(review, false);
  },
  addPrecedent: (precedent) => {
    set((state) => ({ precedents: [precedent, ...state.precedents] }));
    void precedentsCrud.save(precedent, false);
  },
  addConflictRecord: (record) => {
    set((state) => ({ conflictHistory: [record, ...state.conflictHistory] }));
    void conflictCrud.save(record, false);
  },
  setKnowledgeAssets: (knowledgeAssets) => set({ knowledgeAssets }),
  addKnowledgeAsset: (asset) => {
    set((state) => ({ knowledgeAssets: [asset, ...state.knowledgeAssets] }));
    void knowledgeCrud.save(asset, false);
  },
  setSpecializedTracks: (specializedTracks) => set({ specializedTracks }),
  addSpecializedTrack: (track) => {
    set((state) => ({ specializedTracks: [track, ...state.specializedTracks] }));
    void tracksCrud.save(track, false);
  },
  setTrainingPathways: (trainingPathways) => set({ trainingPathways }),
  setAssessments: (assessments) => set({ assessments }),

  updateRiskStatus: (id, status) => {
    set((state) => ({
      riskRegisters: state.riskRegisters.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
    const updated = get().riskRegisters.find((r) => r.id === id);
    if (updated) void riskCrud.save(updated, true);
  },
  updateComplianceIssueStatus: (id, status) => {
    set((state) => ({
      complianceIssues: state.complianceIssues.map((i) => (i.id === id ? { ...i, status } : i)),
    }));
    const updated = get().complianceIssues.find((i) => i.id === id);
    if (updated) void issuesCrud.save(updated, true);
  },
  updateQAChecklist: (reviewId, itemId, isMet) => {
    set((state) => ({
      qaReviews: state.qaReviews.map(review =>
        review.id === reviewId
          ? { ...review, checklist: review.checklist.map(item => item.id === itemId ? { ...item, isMet } : item) }
          : review
      )
    }));
    const updated = get().qaReviews.find(r => r.id === reviewId);
    if (updated) void qaReviewsCrud.save(updated, true);
  },
  updateQAStatus: (reviewId, status) => {
    set((state) => ({
      qaReviews: state.qaReviews.map(review => review.id === reviewId ? { ...review, status, completedAt: status === 'Approved' ? new Date().toISOString() : review.completedAt } : review)
    }));
    const updated = get().qaReviews.find(r => r.id === reviewId);
    if (updated) void qaReviewsCrud.save(updated, true);
  },
  toggleSpecializedChecklist: (trackId, checklistId) => {
    set((state) => ({
      specializedTracks: state.specializedTracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              checklist: t.checklist.map((c) => (c.id === checklistId ? { ...c, done: !c.done } : c)),
            }
          : t
      ),
    }));
    const updated = get().specializedTracks.find((t) => t.id === trackId);
    if (updated) void tracksCrud.save(updated, true);
  },
  updateSpecializedTrackStatus: (trackId, status) => {
    set((state) => ({
      specializedTracks: state.specializedTracks.map((t) =>
        t.id === trackId ? { ...t, status } : t
      ),
    }));
    const updated = get().specializedTracks.find((t) => t.id === trackId);
    if (updated) void tracksCrud.save(updated, true);
  },
  updateTrainingModuleStatus: (pathwayId, moduleId, status) => {
    set((state) => ({
      trainingPathways: state.trainingPathways.map(pathway =>
        pathway.id === pathwayId
          ? {
              ...pathway,
              modules: pathway.modules.map(mod => mod.id === moduleId ? { ...mod, status, completedAt: status === 'Completed' ? new Date().toISOString() : mod.completedAt } : mod),
              overallProgress: Math.round((pathway.modules.length > 0 ? (pathway.modules.filter(m => m.status === 'Completed').length / pathway.modules.length) * 100 : 0))
            }
          : pathway
      )
    }));
    const updated = get().trainingPathways.find(p => p.id === pathwayId);
    if (updated) void pathwaysCrud.save(updated, true);
  },
}));
