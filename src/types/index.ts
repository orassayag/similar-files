export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
}

export type DuplicateGroup = FileInfo[];

export interface DeleteResult {
  success: boolean;
  path: string;
  error?: string;
}

export interface Statistics {
  totalFilesScanned: number;
  duplicateGroupsFound: number;
  totalDuplicateFiles: number;
  potentialSpaceSaved: number;
  filesDeleted: number;
  deletionsFailed: number;
}

export interface Settings {
  scanPath: string;
  ignorePaths: string[];
  sizeToleranceBytes: number;
  dryMode: boolean;
}
