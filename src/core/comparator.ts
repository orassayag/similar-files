import { FileInfo } from '../types';

export class Comparator {
  areSimilar(fileA: FileInfo, fileB: FileInfo, sizeToleranceBytes: number): boolean {
    if (fileA.path === fileB.path) {
      return false;
    }
    if (fileA.extension !== fileB.extension) {
      return false;
    }
    if (!fileA.name || !fileB.name) {
      return false;
    }
    const nameMatch = fileA.name.includes(fileB.name) || fileB.name.includes(fileA.name);
    if (!nameMatch) {
      return false;
    }
    const sizeDiff = Math.abs(fileA.size - fileB.size);
    return sizeDiff <= sizeToleranceBytes;
  }
}
