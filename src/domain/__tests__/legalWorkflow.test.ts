import { describe, it, expect } from 'vitest';
import { canTransitionCaseStatus, mapCaseStatusToStage, assertDeadlineDate } from '../legalWorkflow';

describe('Legal Workflow Domain', () => {
  describe('canTransitionCaseStatus', () => {
    it('should allow transition from "تحت الدراسة" to "نشطة"', () => {
      expect(canTransitionCaseStatus('تحت الدراسة', 'نشطة')).toBe(true);
    });

    it('should not allow transition from "مغلقة" to "نشطة"', () => {
      expect(canTransitionCaseStatus('مغلقة', 'نشطة')).toBe(false);
    });

    it('should allow staying in the same status', () => {
      expect(canTransitionCaseStatus('نشطة', 'نشطة')).toBe(true);
    });
  });

  describe('mapCaseStatusToStage', () => {
    it('should map "نشطة" to "hearing"', () => {
      expect(mapCaseStatusToStage('نشطة')).toBe('hearing');
    });

    it('should map "تحت الدراسة" to "intake"', () => {
      expect(mapCaseStatusToStage('تحت الدراسة')).toBe('intake');
    });

    it('should map "مغلقة" to "closed"', () => {
      expect(mapCaseStatusToStage('مغلقة')).toBe('closed');
    });
  });

  describe('assertDeadlineDate', () => {
    it('should throw "PAST_DEADLINE_NOT_ALLOWED" for a past date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      
      expect(() => assertDeadlineDate(dateString)).toThrow('PAST_DEADLINE_NOT_ALLOWED');
    });

    it('should not throw for today or future dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      expect(() => assertDeadlineDate(today)).not.toThrow();
      expect(() => assertDeadlineDate(tomorrowString)).not.toThrow();
    });

    it('should throw "INVALID_DEADLINE_DATE" for invalid strings', () => {
      expect(() => assertDeadlineDate('not-a-date')).toThrow('INVALID_DEADLINE_DATE');
    });
  });
});
