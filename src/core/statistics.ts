import { DuplicateGroup, DeleteResult, Statistics } from '../types';
import { formatNumber, formatBytes } from '../utils';

export class StatisticsCollector {
  aggregate(
    totalFiles: number,
    duplicateGroups: DuplicateGroup[],
    deleteResults: DeleteResult[]
  ): Statistics {
    const totalDuplicateFiles = duplicateGroups.reduce(
      (sum: number, group: DuplicateGroup) => sum + (group.length - 1),
      0
    );
    const potentialSpaceSaved = duplicateGroups.reduce(
      (sum: number, group: DuplicateGroup) => {
        const duplicates = group.slice(1);
        return (
          sum +
          duplicates.reduce((groupSum: number, file) => groupSum + file.size, 0)
        );
      },
      0
    );
    const filesDeleted = deleteResults.filter(
      (r: DeleteResult) => r.success
    ).length;
    const deletionsFailed = deleteResults.filter(
      (r: DeleteResult) => !r.success
    ).length;
    return {
      totalFilesScanned: totalFiles,
      duplicateGroupsFound: duplicateGroups.length,
      totalDuplicateFiles,
      potentialSpaceSaved,
      filesDeleted,
      deletionsFailed,
    };
  }

  displayScanResults(
    stats: Statistics,
    duplicateGroups: DuplicateGroup[]
  ): void {
    console.log('\n✅ Scan completed\n');
    console.log(`Files scanned: ${formatNumber(stats.totalFilesScanned)}`);
    console.log(`Similar groups found: ${stats.duplicateGroupsFound}`);
    console.log(`Duplicate files: ${stats.totalDuplicateFiles}`);
    console.log(
      `Potential space saved: ${formatBytes(stats.potentialSpaceSaved)}\n`
    );
    if (duplicateGroups.length > 0) {
      this.displayGroups(duplicateGroups);
    }
  }

  displayGroups(groups: DuplicateGroup[]): void {
    let groupNumber = 1;
    for (const group of groups) {
      const totalSize = group.reduce((sum: number, file) => sum + file.size, 0);
      console.log('═══════════════════════════════════════');
      console.log(
        `Group #${groupNumber} (${group.length} files, ${formatBytes(totalSize)})`
      );
      console.log('═══════════════════════════════════════');
      console.log(
        `[KEEP]   ${group[0].path} (${formatNumber(group[0].size)} bytes)`
      );
      for (let i = 1; i < group.length; i++) {
        console.log(
          `[DELETE] ${group[i].path} (${formatNumber(group[i].size)} bytes)`
        );
      }
      console.log('');
      groupNumber++;
    }
  }

  displayDeletionResults(stats: Statistics): void {
    console.log('\n═══════════════════════════════════════');
    console.log('Deletion Summary');
    console.log('═══════════════════════════════════════');
    console.log(`Files deleted: ${stats.filesDeleted}`);
    if (stats.deletionsFailed > 0) {
      console.log(`Deletions failed: ${stats.deletionsFailed}`);
    }
    const actualSpaceFreed = stats.potentialSpaceSaved;
    console.log(`Actual space freed: ${formatBytes(actualSpaceFreed)}`);
    console.log('');
  }
}
