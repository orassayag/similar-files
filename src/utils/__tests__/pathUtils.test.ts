import { describe, it, expect } from 'vitest';
import { shouldIgnorePath } from '../pathUtils';

describe('pathUtils', () => {
  describe('shouldIgnorePath', () => {
    it('should return false when ignorePatterns is empty', () => {
      expect(shouldIgnorePath('/some/path', [])).toBe(false);
    });

    it('should return true when path contains ignore pattern', () => {
      expect(shouldIgnorePath('/project/node_modules/package', ['node_modules'])).toBe(true);
    });

    it('should return false when path does not contain ignore pattern', () => {
      expect(shouldIgnorePath('/project/src/main.ts', ['node_modules'])).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(shouldIgnorePath('/project/NODE_MODULES/package', ['node_modules'])).toBe(true);
      expect(shouldIgnorePath('/project/node_modules/package', ['NODE_MODULES'])).toBe(true);
    });

    it('should match any of multiple patterns', () => {
      const patterns = ['node_modules', '.git', 'dist'];
      expect(shouldIgnorePath('/project/.git/config', patterns)).toBe(true);
      expect(shouldIgnorePath('/project/dist/main.js', patterns)).toBe(true);
      expect(shouldIgnorePath('/project/src/main.ts', patterns)).toBe(false);
    });

    it('should match patterns anywhere in path', () => {
      expect(shouldIgnorePath('/a/b/node_modules/c/d', ['node_modules'])).toBe(true);
      expect(shouldIgnorePath('/node_modules/project/src', ['node_modules'])).toBe(true);
    });
  });
});
