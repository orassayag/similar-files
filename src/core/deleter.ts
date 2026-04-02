import { rm } from 'fs/promises';
import { createInterface } from 'readline';
import { DuplicateGroup, DeleteResult } from '../types';
import { formatBytes } from '../utils/formatUtils';

export class Deleter {
  async deleteWithConfirmation(groups: DuplicateGroup[]): Promise<DeleteResult[]> {
    const results: DeleteResult[] = [];
    let groupNumber = 1;
    for (const group of groups) {
      const shouldDelete = await this.confirmGroupDeletion(group, groupNumber);
      if (shouldDelete === 'quit') {
        console.log('\nDeletion process cancelled by user.\n');
        break;
      }
      if (shouldDelete === 'yes') {
        const filesToDelete = group.slice(1);
        for (const file of filesToDelete) {
          console.log(`Deleting: ${file.path}`);
          try {
            await rm(file.path);
            results.push({
              success: true,
              path: file.path,
            });
          } catch (error) {
            results.push({
              success: false,
              path: file.path,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
      groupNumber++;
    }
    return results;
  }

  private async confirmGroupDeletion(
    group: DuplicateGroup,
    groupNumber: number
  ): Promise<'yes' | 'no' | 'quit'> {
    const totalSize = group.reduce((sum: number, file) => sum + file.size, 0);
    console.log('\n═══════════════════════════════════════');
    console.log(`Group #${groupNumber} (${group.length} files, ${formatBytes(totalSize)})`);
    console.log('═══════════════════════════════════════');
    console.log(`[KEEP]   ${group[0].path} (${group[0].size} bytes)`);
    for (let i = 1; i < group.length; i++) {
      console.log(`[DELETE] ${group[i].path} (${group[i].size} bytes)`);
    }
    const filesToDeleteCount = group.length - 1;
    const answer = await this.promptUser(
      `\nDelete ${filesToDeleteCount} file${filesToDeleteCount > 1 ? 's' : ''} in this group? (y/n/q): `
    );
    const normalized = answer.toLowerCase().trim();
    if (normalized === 'q' || normalized === 'quit') {
      return 'quit';
    }
    if (normalized === 'y' || normalized === 'yes') {
      return 'yes';
    }
    return 'no';
  }

  private async promptUser(question: string): Promise<string> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(question, (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}
