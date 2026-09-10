import { create } from 'zustand';
import { UserProfile } from '../types';


interface AuthState {
  currentUser: UserProfile | null;
  isDemoMode: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
  setDemoMode: (isDemoMode: boolean) => void;
  hasPermission: (action: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isDemoMode: false,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  
  hasPermission: (action: string) => {
    const userRole = get().currentUser?.role;
    if (!userRole) return false;

    // Define permission mapping
    const permissions: Record<string, string[]> = {
      'محامي شريك': ['*'], // Full Access
      'مدير مكتب': ['*'], // Full Access (Admin)
      'محامي': ['view_cases', 'edit_cases', 'view_clients', 'legal_qa', 'conflict_check', 'documents', 'manage_operations'],
      'محامي مستشار': ['view_cases', 'view_clients', 'legal_qa', 'conflict_check', 'view_reports', 'documents', 'manage_operations'],
      'سكرتير': ['view_clients', 'edit_clients', 'view_cases', 'documents', 'finance_basic'],
      // Trainees can view their assigned cases and the wiki, but not
      // manage practice-area modules (enforcement, CLM, IP, advisory,
      // specialized tracks) or the office's own settings/portal access.
      'محامي متدرب': ['view_cases', 'training_portal', 'view_wiki', 'documents'],
    };

    const rolePerms = permissions[userRole] || [];
    return rolePerms.includes('*') || rolePerms.includes(action);
  }
}));
