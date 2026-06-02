import { describe, it, expect } from 'vitest';
import { DuplicateFinder } from '..';
import { FileInfo } from '../../types';

describe('DuplicateFinder', () => {
  const finder = new DuplicateFinder();

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

  describe('findDuplicates', () => {
    it('should return empty array when no files provided', () => {
      const result = finder.findDuplicates([], 100);
      expect(result).toEqual([]);
    });

    it('should return empty array when only one file provided', () => {
      const files = [createFileInfo('/path/Or.txt', 'Or', '.txt', 1000)];
      const result = finder.findDuplicates(files, 100);
      expect(result).toEqual([]);
    });

    it('should find duplicate group with similar names and sizes', () => {
      const files = [
        createFileInfo('/path/a/Or.txt', 'Or', '.txt', 1000),
        createFileInfo('/path/b/Or (1).txt', 'Or (1)', '.txt', 1050),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should not group files with different extensions', () => {
      const files = [
        createFileInfo('/path/Or.txt', 'Or', '.txt', 1000),
        createFileInfo('/path/Or.pdf', 'Or', '.pdf', 1000),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toEqual([]);
    });

    it('should group multiple similar files together', () => {
      const files = [
        createFileInfo('/path/a/Or.txt', 'Or', '.txt', 1000),
        createFileInfo('/path/b/Or (1).txt', 'Or (1)', '.txt', 1050),
        createFileInfo('/path/c/Copy of Or.txt', 'Copy of Or', '.txt', 1030),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(3);
    });

    it('should create separate groups for unrelated files', () => {
      const files = [
        createFileInfo('/path/a/Or.txt', 'Or', '.txt', 1000),
        createFileInfo('/path/b/Or (1).txt', 'Or (1)', '.txt', 1050),
        createFileInfo('/path/c/File.txt', 'File', '.txt', 2000),
        createFileInfo('/path/d/File (1).txt', 'File (1)', '.txt', 2050),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
    });

    it('should not group files exceeding size tolerance', () => {
      const files = [
        createFileInfo('/path/a/Or.txt', 'Or', '.txt', 1000),
        createFileInfo('/path/b/Or (1).txt', 'Or (1)', '.txt', 1200),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toEqual([]);
    });

    it('should handle files with no extension', () => {
      const files = [
        createFileInfo('/path/README', 'README', '', 1000),
        createFileInfo('/path/README_copy', 'README_copy', '', 1050),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should handle zero tolerance', () => {
      const files = [
        createFileInfo('/path/a/Or.txt', 'Or', '.txt', 1000),
        createFileInfo('/path/b/Or (1).txt', 'Or (1)', '.txt', 1000),
      ];
      const result = finder.findDuplicates(files, 0);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should group transitively similar files', () => {
      const files = [
        createFileInfo('/path/a/File.txt', 'File', '.txt', 1000),
        createFileInfo('/path/b/File1.txt', 'File1', '.txt', 1050),
        createFileInfo('/path/c/File12.txt', 'File12', '.txt', 1100),
      ];
      const result = finder.findDuplicates(files, 100);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(3);
    });
  });
});
