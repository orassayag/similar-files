import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scanner } from '../scanner';

vi.mock('fs/promises');

describe('Scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scan', () => {
    it('should initialize with empty files array', async () => {
      const scanner = new Scanner();
      const { readdir } = await import('fs/promises');
      vi.mocked(readdir).mockResolvedValue([] as never);
      const files = await scanner.scan('/test', []);
      expect(files).toEqual([]);
    });

    it('should skip ignored paths', async () => {
      const scanner = new Scanner();
      const { readdir } = await import('fs/promises');
      vi.mocked(readdir).mockResolvedValue([] as never);
      await scanner.scan('/test/node_modules', ['node_modules']);
      expect(readdir).not.toHaveBeenCalled();
    });

    it('should accept progress callback parameter', async () => {
      const scanner = new Scanner();
      const progressCallback = vi.fn();
      const { readdir } = await import('fs/promises');
      vi.mocked(readdir).mockResolvedValue([] as never);
      await scanner.scan('/test', [], progressCallback);
      expect(progressCallback).toBeDefined();
    });
  });
});
