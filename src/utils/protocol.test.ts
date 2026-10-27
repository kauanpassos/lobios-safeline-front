import { describe, it, expect } from 'vitest';
import { formatProtocolCode } from './protocol';

describe('protocol.ts - formatProtocolCode', () => {
  it('deve preservar protocolo que já segue o padrão SafeLine (XXXX-XXXX-XXXX)', () => {
    expect(formatProtocolCode('QBDU-DAFT-FS7A')).toBe('QBDU-DAFT-FS7A');
    expect(formatProtocolCode('qbdu-daft-fs7a')).toBe('QBDU-DAFT-FS7A');
  });

  it('deve preservar padrões com hífen legados', () => {
    expect(formatProtocolCode('NH3 - YGW')).toBe('NH3 - YGW');
  });

  it('deve formatar IDs GUID em protocolo no padrão 4-4-4', () => {
    const guid = 'e8a5b120-1b2c-4f12-89ab-cdef01234567';
    expect(formatProtocolCode(guid)).toBe('E8A5-B120-1B2C');
  });

  it('deve lidar com valores vazios ou nulos', () => {
    expect(formatProtocolCode('')).toBe('N/A');
    expect(formatProtocolCode(null)).toBe('N/A');
    expect(formatProtocolCode(undefined)).toBe('N/A');
  });
});
