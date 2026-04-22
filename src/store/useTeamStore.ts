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

export const useTeamStore = create<TeamState>((set) => ({
  teamMembers: [],
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
