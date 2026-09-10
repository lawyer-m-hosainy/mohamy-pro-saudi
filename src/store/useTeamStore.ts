import { create } from 'zustand';
import { TeamMember, Task } from '../types';
import { saveTeamMember, deleteTeamMember } from '../services/legalDataService';
import { createTenantCrud } from '../services/genericCrud';

const tasksCrud = createTenantCrud<Task>('tasks');

interface TeamState {
  teamMembers: TeamMember[];
  tasks: Task[];
  setTeamMembers: (members: TeamMember[]) => void;
  setTasks: (tasks: Task[]) => void;
  loadTasks: () => Promise<void>;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: 'pending' | 'completed') => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teamMembers: [],
  tasks: [],

  setTeamMembers: (teamMembers) => set({ teamMembers }),
  setTasks: (tasks) => set({ tasks }),
  loadTasks: async () => {
    const tasks = await tasksCrud.fetchAll();
    set({ tasks });
  },
  addTeamMember: (member) => {
    set((state) => ({ teamMembers: [...state.teamMembers, member] }));
    void saveTeamMember(member, false);
  },
  updateTeamMember: (id, updates) => {
    set((state) => ({
      teamMembers: state.teamMembers.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
    const updated = get().teamMembers.find(m => m.id === id);
    if (updated) void saveTeamMember(updated, true);
  },
  removeTeamMember: (id) => {
    set((state) => ({ teamMembers: state.teamMembers.filter(m => m.id !== id) }));
    void deleteTeamMember(id);
  },
  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    void tasksCrud.save(task, false);
  },
  updateTaskStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
    const updated = get().tasks.find(t => t.id === id);
    if (updated) void tasksCrud.save(updated, true);
  },
}));
