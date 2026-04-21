import { describe, it, expect } from 'vitest';
import { generateZatcaTLV } from '../zatca';

describe('ZATCA Library', () => {
  it('should return a valid Base64 string', () => {
    const result = generateZatcaTLV(
      'Sada Law Firm',
      '310122393500003',
      '2023-10-25T15:30:00Z',
      '1150.00',
      '150.00'
    );
    
    // Check if it's base64
    expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
    
    // Decode base64 to check content
    const decoded = atob(result);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    // Check tags 1 to 5 exist in order
    let offset = 0;
    for (let tag = 1; tag <= 5; tag++) {
      expect(bytes[offset]).toBe(tag);
      const length = bytes[offset + 1];
      offset += 2 + length;
    }
  });
});
