import { FileInfo, DuplicateGroup } from '../types';
import { Comparator } from './comparator';

export class DuplicateFinder {
  private comparator: Comparator;

  constructor() {
    this.comparator = new Comparator();
  }

  findDuplicates(files: FileInfo[], sizeToleranceBytes: number): DuplicateGroup[] {
    const extensionGroups = this.groupByExtension(files);
    const allGroups: DuplicateGroup[] = [];
    for (const extensionFiles of extensionGroups.values()) {
      if (extensionFiles.length < 2) {
        continue;
      }
      const groups = this.findGroupsInExtension(extensionFiles, sizeToleranceBytes);
      allGroups.push(...groups);
    }
    return allGroups;
  }

  private groupByExtension(files: FileInfo[]): Map<string, FileInfo[]> {
    const groups = new Map<string, FileInfo[]>();
    for (const file of files) {
      const ext = file.extension;
      if (!groups.has(ext)) {
        groups.set(ext, []);
      }
      groups.get(ext)!.push(file);
    }
    return groups;
  }

  private findGroupsInExtension(files: FileInfo[], sizeToleranceBytes: number): DuplicateGroup[] {
    const n = files.length;
    const parent = new Array(n);
    for (let i = 0; i < n; i++) {
      parent[i] = i;
    }
    const find = (x: number): number => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };
    const union = (x: number, y: number): void => {
      const rootX = find(x);
      const rootY = find(y);
      if (rootX !== rootY) {
        parent[rootX] = rootY;
      }
    };
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.comparator.areSimilar(files[i], files[j], sizeToleranceBytes)) {
          union(i, j);
        }
      }
    }
    const groupMap = new Map<number, FileInfo[]>();
    for (let i = 0; i < n; i++) {
      const root = find(i);
      if (!groupMap.has(root)) {
        groupMap.set(root, []);
      }
      groupMap.get(root)!.push(files[i]);
    }
    return Array.from(groupMap.values()).filter((group: DuplicateGroup) => group.length >= 2);
  }
}
