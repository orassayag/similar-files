import { describe, it, expect } from 'vitest';
import { StatisticsCollector } from '../statistics';
import { DuplicateGroup, DeleteResult } from '../../types';

describe('StatisticsCollector', () => {
  const collector = new StatisticsCollector();

  const createGroup = (sizes: number[]): DuplicateGroup =>
    sizes.map((size: number, index: number) => ({
      path: `/path/${index}.txt`,
      name: `file${index}`,
      extension: '.txt',
      size,
    }));

  describe('aggregate', () => {
    it('should calculate statistics for no duplicates', () => {
      const stats = collector.aggregate(100, [], []);
      expect(stats.totalFilesScanned).toBe(100);
      expect(stats.duplicateGroupsFound).toBe(0);
      expect(stats.totalDuplicateFiles).toBe(0);
      expect(stats.potentialSpaceSaved).toBe(0);
      expect(stats.filesDeleted).toBe(0);
      expect(stats.deletionsFailed).toBe(0);
    });

    it('should calculate statistics for one duplicate group', () => {
      const groups = [createGroup([1000, 1050])];
      const stats = collector.aggregate(100, groups, []);
      expect(stats.totalFilesScanned).toBe(100);
      expect(stats.duplicateGroupsFound).toBe(1);
      expect(stats.totalDuplicateFiles).toBe(1);
      expect(stats.potentialSpaceSaved).toBe(1050);
    });

    it('should calculate statistics for multiple duplicate groups', () => {
      const groups = [createGroup([1000, 1050, 1030]), createGroup([2000, 2050])];
      const stats = collector.aggregate(100, groups, []);
      expect(stats.duplicateGroupsFound).toBe(2);
      expect(stats.totalDuplicateFiles).toBe(3);
      expect(stats.potentialSpaceSaved).toBe(1050 + 1030 + 2050);
    });

    it('should track successful deletions', () => {
      const groups = [createGroup([1000, 1050])];
      const deleteResults: DeleteResult[] = [{ success: true, path: '/path/1.txt' }];
      const stats = collector.aggregate(100, groups, deleteResults);
      expect(stats.filesDeleted).toBe(1);
      expect(stats.deletionsFailed).toBe(0);
    });

    it('should track failed deletions', () => {
      const groups = [createGroup([1000, 1050])];
      const deleteResults: DeleteResult[] = [
        { success: false, path: '/path/1.txt', error: 'Permission denied' },
      ];
      const stats = collector.aggregate(100, groups, deleteResults);
      expect(stats.filesDeleted).toBe(0);
      expect(stats.deletionsFailed).toBe(1);
    });

    it('should track mixed deletion results', () => {
      const groups = [createGroup([1000, 1050, 1030])];
      const deleteResults: DeleteResult[] = [
        { success: true, path: '/path/1.txt' },
        { success: false, path: '/path/2.txt', error: 'Permission denied' },
      ];
      const stats = collector.aggregate(100, groups, deleteResults);
      expect(stats.filesDeleted).toBe(1);
      expect(stats.deletionsFailed).toBe(1);
    });
  });
});
