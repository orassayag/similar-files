import { settings } from './index';
import { Scanner, DuplicateFinder, Deleter, StatisticsCollector } from './core';

async function main() {
  console.log('\n🔍 Similar Files Detector\n');
  if (settings.dryMode) {
    console.log('[DRY MODE] No files will be deleted\n');
  }
  console.log(`Scanning: ${settings.scanPath}`);
  if (settings.ignorePaths.length > 0) {
    console.log(`Ignoring paths: ${settings.ignorePaths.join(', ')}`);
  }
  console.log(`Size tolerance: ${settings.sizeToleranceBytes} bytes`);
  console.log('\nScanning files...\n');
  const scanner = new Scanner();
  const files = await scanner.scan(
    settings.scanPath,
    settings.ignorePaths,
    (currentPath: string, foundCount: number) => {
      const truncatedPath =
        currentPath.length > 80 ? '...' + currentPath.slice(-77) : currentPath;
      process.stdout.write(
        `\rFiles scanned: ${foundCount} | Current: ${truncatedPath}${' '.repeat(20)}`
      );
    }
  );
  process.stdout.write('\r' + ' '.repeat(120) + '\r');
  const finder = new DuplicateFinder();
  const duplicateGroups = finder.findDuplicates(
    files,
    settings.sizeToleranceBytes
  );
  const statisticsCollector = new StatisticsCollector();
  const initialStats = statisticsCollector.aggregate(
    files.length,
    duplicateGroups,
    []
  );
  statisticsCollector.displayScanResults(initialStats, duplicateGroups);
  if (!settings.dryMode && duplicateGroups.length > 0) {
    console.log('\n🗑️  Starting deletion process...\n');
    const deleter = new Deleter();
    const deleteResults = await deleter.deleteWithConfirmation(duplicateGroups);
    const finalStats = statisticsCollector.aggregate(
      files.length,
      duplicateGroups,
      deleteResults
    );
    statisticsCollector.displayDeletionResults(finalStats);
  }
  console.log('✅ Done!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
