import { create } from 'zustand';
import { TeamMember, Task } from '../types';


interface TeamState {
  teamMembers: TeamMember[];
  tasks: Task[];
  setTeamMembers: (members: TeamMember[]) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: 'pending' | 'completed') => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teamMembers: [],
  tasks: [],

  setTeamMembers: (teamMembers) => set({ teamMembers }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
}));
