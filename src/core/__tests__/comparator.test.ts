import { describe, it, expect } from 'vitest';
import { Comparator } from '../comparator';
import { FileInfo } from '../../types';

describe('Comparator', () => {
  const comparator = new Comparator();

  const createFileInfo = (
    path: string,
    name: string,
    extension: string,
    size: number
  ): FileInfo => ({
    path,
    name,
    extension,
    size,
  });

  describe('areSimilar', () => {
    it('should return false for same file path', () => {
      const file = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      expect(comparator.areSimilar(file, file, 100)).toBe(false);
    });

    it('should return false for different extensions', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or.pdf', 'Or', '.pdf', 1000);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(false);
    });

    it('should return false for empty filenames', () => {
      const fileA = createFileInfo('/path/.txt', '', '.txt', 1000);
      const fileB = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(false);
    });

    it('should return true when one name contains the other and size is within tolerance', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or (1).txt', 'Or (1)', '.txt', 1050);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(true);
    });

    it('should return true for "Copy of" prefix pattern', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Copy of Or.txt', 'Copy of Or', '.txt', 1050);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(true);
    });

    it('should return true for numeric suffix pattern', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or1.txt', 'Or1', '.txt', 1050);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(true);
    });

    it('should return false when size exceeds tolerance', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or (1).txt', 'Or (1)', '.txt', 1200);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(false);
    });

    it('should be case-sensitive for names', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/or.txt', 'or', '.txt', 1000);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(false);
    });

    it('should return true when names match exactly', () => {
      const fileA = createFileInfo('/path/a/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/b/Or.txt', 'Or', '.txt', 1050);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(true);
    });

    it('should work with zero tolerance', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or (1).txt', 'Or (1)', '.txt', 1000);
      expect(comparator.areSimilar(fileA, fileB, 0)).toBe(true);
    });

    it('should return false with zero tolerance and different sizes', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or (1).txt', 'Or (1)', '.txt', 1001);
      expect(comparator.areSimilar(fileA, fileB, 0)).toBe(false);
    });

    it('should handle empty extension files', () => {
      const fileA = createFileInfo('/path/README', 'README', '', 1000);
      const fileB = createFileInfo('/path/README_copy', 'README_copy', '', 1050);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(true);
    });

    it('should not match names that do not contain each other', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/File.txt', 'File', '.txt', 1000);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(false);
    });
  });
});
