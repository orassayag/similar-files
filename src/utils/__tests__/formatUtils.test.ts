import { describe, it, expect } from 'vitest';
import { formatNumber, formatBytes } from '..';

describe('formatUtils', () => {
  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(12421)).toBe('12,421');
    });

    it('should handle small numbers without separators', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle large numbers', () => {
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 bytes');
    });

    it('should format bytes', () => {
      expect(formatBytes(100)).toBe('100.00 bytes');
      expect(formatBytes(1023)).toBe('1023.00 bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(5120)).toBe('5.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1.00 MB');
      expect(formatBytes(5242880)).toBe('5.00 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1.00 GB');
      expect(formatBytes(5368709120)).toBe('5.00 GB');
    });

    it('should handle decimal values', () => {
      expect(formatBytes(1536)).toBe('1.50 KB');
      expect(formatBytes(1572864)).toBe('1.50 MB');
    });
  });
});
