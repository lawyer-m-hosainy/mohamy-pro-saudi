import { describe, it, expect } from 'vitest';
import { 
  linkCaseToNajiz, 
  addCaseMemorandum, 
  createDeadline, 
  transitionCaseStatus 
} from '../useCases';
import { CasesRepository } from '@/repositories/casesRepository';
import { Case } from '@/types';

// Mock simple repository for testing
class MockCasesRepository implements CasesRepository {
  private cases: Case[] = [];
  
  constructor(initialCases: Case[] = []) {
    this.cases = initialCases;
  }
  
  getCases() {
    return this.cases;
  }
  
  saveCases(cases: Case[]) {
    this.cases = cases;
  }
  
  addDeadline() {
    // mock add deadline
  }
}

describe('linkCaseToNajiz', () => {
  it('يغير حالة ناجز إلى مربوط بناجز', () => {
    const mockCase: Case = {
      id: 'C-1',
      najizReferenceStatus: 'غير مربوط',
      status: 'نشطة',
      workflowStage: 'intake',
      plaintiff: 'A',
      defendant: 'B',
      type: 'تجاري',
      court: 'المحكمة التجارية',
      powerOfAttorneyRef: '',
      createdAt: '2024-03-10T12:00:00Z',
      memorandums: [],
      documents: []
    };
    const repo = new MockCasesRepository([mockCase]);
    
    linkCaseToNajiz(repo, 'C-1');
    
    const updated = repo.getCases().find(c => c.id === 'C-1');
    expect(updated?.najizReferenceStatus).toBe('مربوط بناجز');
  });
});

describe('addCaseMemorandum', () => {
  it('يضيف اسم المذكرة لمصفوفة المذكرات ويغير حالة سير العمل إلى pleadings', () => {
    const mockCase: Case = {
      id: 'C-2',
      najizReferenceStatus: 'غير مربوط',
      status: 'نشطة',
      workflowStage: 'intake',
      plaintiff: 'A',
      defendant: 'B',
      type: 'تجاري',
      court: 'المحكمة التجارية',
      powerOfAttorneyRef: '',
      createdAt: '2024-03-10T12:00:00Z',
      memorandums: [],
      documents: []
    };
    const repo = new MockCasesRepository([mockCase]);
    
    addCaseMemorandum(repo, 'C-2', 'مذكرة دفاع أولى');
    
    const updated = repo.getCases().find(c => c.id === 'C-2');
    expect(updated?.memorandums).toContain('مذكرة دفاع أولى');
    expect(updated?.workflowStage).toBe('pleadings');
  });
});

describe('createDeadline', () => {
  it('ينشئ موعد نهائي بمعرف فريد وحالة معلقة', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    const deadline = createDeadline({
      caseId: 'C-1',
      title: 'موعد إيداع',
      date: dateStr,
      type: 'تقديم مذكرة',
      priority: 'high'
    });
    
    expect(deadline.id).toBeDefined();
    expect(deadline.status).toBe('pending');
    expect(deadline.title).toBe('موعد إيداع');
  });
});

describe('transitionCaseStatus', () => {
  it('يرمي خطأ عند انتقال غير صالح', () => {
    const mockCase: Case = {
      id: 'C-3',
      najizReferenceStatus: 'غير مربوط',
      status: 'مغلقة',
      workflowStage: 'closed',
      plaintiff: 'A',
      defendant: 'B',
      type: 'تجاري',
      court: 'المحكمة التجارية',
      powerOfAttorneyRef: '',
      createdAt: '2024-03-10T12:00:00Z',
      memorandums: [],
      documents: []
    };
    const repo = new MockCasesRepository([mockCase]);
    
    // محاولة فتح قضية مغلقة
    expect(() => transitionCaseStatus(repo, 'C-3', 'نشطة')).toThrow('INVALID_CASE_STATUS_TRANSITION');
  });
  
  it('يغير حالة القضية ومرحلة سير العمل بنجاح للانتقال الصالح', () => {
    const mockCase: Case = {
      id: 'C-4',
      najizReferenceStatus: 'غير مربوط',
      status: 'تحت الدراسة',
      workflowStage: 'intake',
      plaintiff: 'A',
      defendant: 'B',
      type: 'تجاري',
      court: 'المحكمة التجارية',
      powerOfAttorneyRef: '',
      createdAt: '2024-03-10T12:00:00Z',
      memorandums: [],
      documents: []
    };
    const repo = new MockCasesRepository([mockCase]);
    
    transitionCaseStatus(repo, 'C-4', 'نشطة');
    
    const updated = repo.getCases().find(c => c.id === 'C-4');
    expect(updated?.status).toBe('نشطة');
    expect(updated?.workflowStage).toBe('hearing');
  });
});
