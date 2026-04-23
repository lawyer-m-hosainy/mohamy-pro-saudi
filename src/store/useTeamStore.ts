import { create } from 'zustand';
import { TeamMember, Task } from '../types';


interface TeamState {
  teamMembers: TeamMember[];
  tasks: Task[];
  setTeamMembers: (members: TeamMember[]) => void;
  setTasks: (tasks: Task[]) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: 'pending' | 'completed') => void;
}

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "U-001",
    name: "عبدالله العتيبي",
    email: "a.otaibi@mohamy.pro",
    role: "شريك مؤسس",
    specializations: ["تجاري", "شركات"],
    avatar: "/avatars/a-otaibi.jpg",
    status: "active"
  },
  {
    id: "U-002",
    name: "سارة الخالد",
    email: "s.alkhaled@mohamy.pro",
    role: "محامي أول",
    specializations: ["عمالي", "إداري"],
    avatar: "/avatars/s-alkhaled.jpg",
    status: "active"
  },
  {
    id: "U-003",
    name: "محمد الدوسري",
    email: "m.aldosari@mohamy.pro",
    role: "مستشار قانوني",
    specializations: ["ملكية فكرية", "صياغة عقود"],
    avatar: "/avatars/m-aldosari.jpg",
    status: "active"
  }
];

export const useTeamStore = create<TeamState>((set) => ({
  teamMembers: MOCK_TEAM_MEMBERS,
  tasks: [],

  setTeamMembers: (teamMembers) => set({ teamMembers }),
  setTasks: (tasks) => set({ tasks }),
  addTeamMember: (member) => set((state) => ({ teamMembers: [...state.teamMembers, member] })),
  updateTeamMember: (id, updates) => set((state) => ({
    teamMembers: state.teamMembers.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  removeTeamMember: (id) => set((state) => ({ teamMembers: state.teamMembers.filter(m => m.id !== id) })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
}));
