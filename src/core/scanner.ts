import { readdir, stat } from 'fs/promises';
import { join, parse } from 'path';
import { FileInfo } from '../types';
import { shouldIgnorePath } from '../utils';

export type ScanProgressCallback = (
  currentPath: string,
  foundCount: number
) => void;

export class Scanner {
  private foundFiles: FileInfo[] = [];
  private progressCallback?: ScanProgressCallback;
  private lastProgressTime = 0;

  async scan(
    rootPath: string,
    ignorePaths: string[],
    onProgress?: ScanProgressCallback
  ): Promise<FileInfo[]> {
    this.foundFiles = [];
    this.progressCallback = onProgress;
    this.lastProgressTime = Date.now();
    await this.scanDirectory(rootPath, ignorePaths);
    return this.foundFiles;
  }

  private updateProgress(currentPath: string): void {
    if (this.progressCallback) {
      const now = Date.now();
      if (now - this.lastProgressTime >= 500) {
        this.progressCallback(currentPath, this.foundFiles.length);
        this.lastProgressTime = now;
      }
    }
  }

  private async scanDirectory(
    currentPath: string,
    ignorePaths: string[]
  ): Promise<void> {
    if (shouldIgnorePath(currentPath, ignorePaths)) {
      return;
    }
    this.updateProgress(currentPath);
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);
        if (shouldIgnorePath(fullPath, ignorePaths)) {
          continue;
        }
        try {
          if (entry.isSymbolicLink()) {
            continue;
          }
          if (entry.isDirectory()) {
            await this.scanDirectory(fullPath, ignorePaths);
          } else if (entry.isFile()) {
            const stats = await stat(fullPath);
            const parsedPath = parse(fullPath);
            this.foundFiles.push({
              path: fullPath,
              name: parsedPath.name,
              extension: parsedPath.ext,
              size: stats.size,
            });
            this.updateProgress(currentPath);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            !errorMessage.includes('EACCES') &&
            !errorMessage.includes('EPERM')
          ) {
            console.error(`\nError processing ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('EACCES') && !errorMessage.includes('EPERM')) {
        console.error(`\nError scanning directory ${currentPath}:`, error);
      }
    }
  }
}
