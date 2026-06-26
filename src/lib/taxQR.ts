/**
 * Tax Invoice QR Code TLV Generator
 * Compatible with Saudi ZATCA and Egyptian Tax Authority formats
 * Tags:
 * 1. Seller Name
 * 2. VAT Registration Number
 * 3. Timestamp
 * 4. Invoice Total (with VAT)
 * 5. VAT Total
 */

export function generateZatcaTLV(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalAmount: string,
  vatAmount: string
): string {
  const encoder = new TextEncoder();
  
  const getTLV = (tag: number, value: string) => {
    const tagBuf = new Uint8Array([tag]);
    const valBuf = encoder.encode(value);
    const lenBuf = new Uint8Array([valBuf.length]);
    const combined = new Uint8Array(tagBuf.length + lenBuf.length + valBuf.length);
    combined.set(tagBuf);
    combined.set(lenBuf, tagBuf.length);
    combined.set(valBuf, tagBuf.length + lenBuf.length);
    return combined;
  };

  const parts = [
    getTLV(1, sellerName),
    getTLV(2, vatNumber),
    getTLV(3, timestamp),
    getTLV(4, totalAmount),
    getTLV(5, vatAmount),
  ];

  const totalLength = parts.reduce((acc, part) => acc + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }

  // Convert Uint8Array to Base64
  let binary = '';
  const bytes = new Uint8Array(combined);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
