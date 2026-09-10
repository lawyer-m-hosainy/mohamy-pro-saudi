import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';

// hasPermission() is the actual enforcement mechanism PermissionGate relies
// on (src/App.tsx) — it had zero test coverage despite gating every
// sensitive route (finance, team, compliance, ...). This locks the current
// permission matrix in place so an accidental edit (a typo in a role name,
// a forgotten permission) fails CI instead of silently over- or
// under-granting access (P9-03, Critical).
describe('useAuthStore.hasPermission', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null, isDemoMode: false });
  });

  it('denies everything when there is no current user', () => {
    expect(useAuthStore.getState().hasPermission('view_cases')).toBe(false);
    expect(useAuthStore.getState().hasPermission('*')).toBe(false);
  });

  it('grants full access ("*") to مدير مكتب and محامي شريك', () => {
    for (const role of ['مدير مكتب', 'محامي شريك'] as const) {
      useAuthStore.setState({ currentUser: { id: 'u1', name: 'ن', email: 'e@e.com', role } });
      const { hasPermission } = useAuthStore.getState();
      expect(hasPermission('view_cases')).toBe(true);
      expect(hasPermission('finance_basic')).toBe(true);
      expect(hasPermission('platform_admin')).toBe(true);
      expect(hasPermission('anything_undefined')).toBe(true);
    }
  });

  it('grants محامي only its documented permissions and denies the rest', () => {
    useAuthStore.setState({ currentUser: { id: 'u2', name: 'ن', email: 'e@e.com', role: 'محامي' } });
    const { hasPermission } = useAuthStore.getState();
    for (const allowed of ['view_cases', 'edit_cases', 'view_clients', 'legal_qa', 'conflict_check', 'documents', 'manage_operations']) {
      expect(hasPermission(allowed)).toBe(true);
    }
    for (const denied of ['finance_basic', 'manage_team', 'platform_admin', 'compliance_view', 'manage_office']) {
      expect(hasPermission(denied)).toBe(false);
    }
  });

  it('grants محامي مستشار only its documented permissions and denies the rest', () => {
    useAuthStore.setState({ currentUser: { id: 'u3', name: 'ن', email: 'e@e.com', role: 'محامي مستشار' } });
    const { hasPermission } = useAuthStore.getState();
    for (const allowed of ['view_cases', 'view_clients', 'legal_qa', 'conflict_check', 'view_reports', 'documents', 'manage_operations']) {
      expect(hasPermission(allowed)).toBe(true);
    }
    for (const denied of ['edit_cases', 'finance_basic', 'manage_team', 'manage_office']) {
      expect(hasPermission(denied)).toBe(false);
    }
  });

  it('grants سكرتير only its documented permissions and denies the rest', () => {
    useAuthStore.setState({ currentUser: { id: 'u4', name: 'ن', email: 'e@e.com', role: 'سكرتير' } });
    const { hasPermission } = useAuthStore.getState();
    for (const allowed of ['view_clients', 'edit_clients', 'view_cases', 'documents', 'finance_basic']) {
      expect(hasPermission(allowed)).toBe(true);
    }
    for (const denied of ['edit_cases', 'manage_team', 'view_reports', 'platform_admin', 'manage_operations', 'manage_office']) {
      expect(hasPermission(denied)).toBe(false);
    }
  });

  it('grants محامي متدرب only its documented permissions and denies the rest', () => {
    useAuthStore.setState({ currentUser: { id: 'u5', name: 'ن', email: 'e@e.com', role: 'محامي متدرب' } });
    const { hasPermission } = useAuthStore.getState();
    for (const allowed of ['view_cases', 'training_portal', 'view_wiki', 'documents']) {
      expect(hasPermission(allowed)).toBe(true);
    }
    for (const denied of ['edit_cases', 'finance_basic', 'view_reports', 'manage_operations', 'manage_office']) {
      expect(hasPermission(denied)).toBe(false);
    }
  });

  it('denies everything for a role with no entry in the permission map', () => {
    // @ts-expect-error deliberately testing an unmapped role value
    useAuthStore.setState({ currentUser: { id: 'u6', name: 'ن', email: 'e@e.com', role: 'غير معروف' } });
    expect(useAuthStore.getState().hasPermission('view_cases')).toBe(false);
  });
});
