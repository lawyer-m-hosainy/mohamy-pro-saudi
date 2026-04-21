import { create } from 'zustand';
import { Case, Session, Deadline } from '../types';


interface CasesState {
  cases: Case[];
  sessions: Session[];
  deadlines: Deadline[];
  setCases: (cases: Case[]) => void;
  addCase: (caseData: Case) => void;
  updateCase: (id: string, updatedData: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  setDeadlines: (deadlines: Deadline[]) => void;
  addDeadline: (deadline: Deadline) => void;
  updateDeadlineStatus: (id: string, status: 'pending' | 'completed' | 'overdue') => void;
}

export const useCasesStore = create<CasesState>((set) => ({
  cases: [
    {
      id: "C-1001",
      title: "قضية تجارية - تعويضات",
      clientName: "شركة الأفق",
      type: "Commercial",
      status: "Active",
      court: "المحكمة التجارية بالرياض",
      plaintiff: "شركة الأفق",
      defendant: "مؤسسة البناء",
      filedDate: "2024-01-15",
      nextSession: "2024-05-20",
      assignedTo: "U-001"
    },
    {
      id: "C-1002",
      title: "نزاع عمالي",
      clientName: "أحمد محمد",
      type: "Labor",
      status: "UnderReview",
      court: "المحكمة العمالية بجدة",
      plaintiff: "أحمد محمد",
      defendant: "شركة التقنية",
      filedDate: "2024-03-10",
      nextSession: "2024-06-12",
      assignedTo: "U-001"
    }
  ],
  sessions: [],
  deadlines: [],

  setCases: (cases) => set({ cases }),
  addCase: (caseData) => set((state) => ({ cases: [caseData, ...state.cases] })),
  updateCase: (id, updatedData) => set((state) => ({
    cases: state.cases.map(c => c.id === id ? { ...c, ...updatedData } : c)
  })),
  deleteCase: (id) => set((state) => ({
    cases: state.cases.filter(c => c.id !== id)
  })),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  setDeadlines: (deadlines) => set({ deadlines }),
  addDeadline: (deadline) => set((state) => ({ deadlines: [...state.deadlines, deadline] })),
  updateDeadlineStatus: (id, status) => set((state) => ({
    deadlines: state.deadlines.map(d => d.id === id ? { ...d, status } : d)
  })),
}));
