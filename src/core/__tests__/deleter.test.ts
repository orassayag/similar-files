import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Deleter } from '../deleter';

vi.mock('fs/promises');
vi.mock('readline');

describe('Deleter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteWithConfirmation', () => {
    it('should initialize deleter', () => {
      const deleter = new Deleter();
      expect(deleter).toBeDefined();
    });

    it('should handle empty groups array', async () => {
      const deleter = new Deleter();
      const results = await deleter.deleteWithConfirmation([]);
      expect(results).toEqual([]);
    });
  });
});
