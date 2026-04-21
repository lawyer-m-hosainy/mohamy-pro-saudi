import { describe, it, expect } from 'vitest';
import { calculateVAT, calculateTotalWithVAT } from '../finance';

describe('Finance Library', () => {
  describe('calculateVAT', () => {
    it('should calculate 15% VAT for 1000', () => {
      expect(calculateVAT(1000)).toBe(150);
    });

    it('should return 0 for 0 amount', () => {
      expect(calculateVAT(0)).toBe(0);
    });

    it('should throw error for negative amount', () => {
      expect(() => calculateVAT(-1)).toThrow('Amount cannot be negative');
    });
  });

  describe('calculateTotalWithVAT', () => {
    it('should calculate total with 15% VAT for 1000', () => {
      expect(calculateTotalWithVAT(1000)).toBe(1150);
    });
  });
});
