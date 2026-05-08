import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Deleter } from '../deleter';
import { rm } from 'fs/promises';
import { createInterface } from 'readline';

import type { Interface } from 'readline';

vi.mock('fs/promises');
vi.mock('readline');

describe('Deleter', () => {
  let mockQuestion: Mock;
  let mockClose: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestion = vi.fn();
    mockClose = vi.fn();
    vi.mocked(createInterface).mockReturnValue({
      question: mockQuestion,
      close: mockClose,
    } as unknown as Interface);
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

    it('should delete files when user confirms with "y"', async () => {
      const deleter = new Deleter();
      const groups = [
        [
          { path: 'keep.txt', size: 100, name: 'keep', extension: '.txt' },
          { path: 'delete.txt', size: 100, name: 'delete', extension: '.txt' },
        ],
      ];

      mockQuestion.mockImplementation((_q: string, cb: (answer: string) => void) => cb('y'));

      const results = await deleter.deleteWithConfirmation(groups);

      expect(rm).toHaveBeenCalledWith('delete.txt');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ success: true, path: 'delete.txt' });
    });

    it('should not delete files when user denies with "n"', async () => {
      const deleter = new Deleter();
      const groups = [
        [
          { path: 'keep.txt', size: 100, name: 'keep', extension: '.txt' },
          { path: 'delete.txt', size: 100, name: 'delete', extension: '.txt' },
        ],
      ];

      mockQuestion.mockImplementation((_q: string, cb: (answer: string) => void) => cb('n'));

      const results = await deleter.deleteWithConfirmation(groups);

      expect(rm).not.toHaveBeenCalled();
      expect(results).toHaveLength(0);
    });

    it('should stop deletion process when user quits with "q"', async () => {
      const deleter = new Deleter();
      const groups = [
        [
          { path: 'keep1.txt', size: 100, name: 'keep1', extension: '.txt' },
          { path: 'delete1.txt', size: 100, name: 'delete1', extension: '.txt' },
        ],
        [
          { path: 'keep2.txt', size: 100, name: 'keep2', extension: '.txt' },
          { path: 'delete2.txt', size: 100, name: 'delete2', extension: '.txt' },
        ],
      ];

      mockQuestion.mockImplementation((_q: string, cb: (answer: string) => void) => cb('q'));

      const results = await deleter.deleteWithConfirmation(groups);

      expect(rm).not.toHaveBeenCalled();
      expect(results).toHaveLength(0);
    });

    it('should handle deletion errors', async () => {
      const deleter = new Deleter();
      const groups = [
        [
          { path: 'keep.txt', size: 100, name: 'keep', extension: '.txt' },
          { path: 'delete.txt', size: 100, name: 'delete', extension: '.txt' },
        ],
      ];

      mockQuestion.mockImplementation((_q: string, cb: (answer: string) => void) => cb('y'));
      vi.mocked(rm).mockRejectedValue(new Error('Permission denied'));

      const results = await deleter.deleteWithConfirmation(groups);

      expect(results[0]).toEqual({
        success: false,
        path: 'delete.txt',
        error: 'Permission denied',
      });
    });

    it('should handle non-Error deletion errors', async () => {
      const deleter = new Deleter();
      const groups = [
        [
          { path: 'keep.txt', size: 100, name: 'keep', extension: '.txt' },
          { path: 'delete.txt', size: 100, name: 'delete', extension: '.txt' },
        ],
      ];

      mockQuestion.mockImplementation((_q: string, cb: (answer: string) => void) => cb('y'));
      vi.mocked(rm).mockRejectedValue('Unknown error');

      const results = await deleter.deleteWithConfirmation(groups);

      expect(results[0]).toEqual({
        success: false,
        path: 'delete.txt',
        error: 'Unknown error',
      });
    });
  });
});
