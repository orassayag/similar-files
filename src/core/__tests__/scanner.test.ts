import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scanner } from '..';
import { readdir, stat } from 'fs/promises';

vi.mock('fs/promises');

describe('Scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scan', () => {
    it('should initialize with empty files array', async () => {
      const scanner = new Scanner();
      vi.mocked(readdir).mockResolvedValue([] as never);
      const files = await scanner.scan('/test', []);
      expect(files).toEqual([]);
    });

    it('should skip ignored paths', async () => {
      const scanner = new Scanner();
      vi.mocked(readdir).mockResolvedValue([] as never);
      await scanner.scan('/test/node_modules', ['node_modules']);
      expect(readdir).not.toHaveBeenCalled();
    });

    it('should scan files recursively', async () => {
      const scanner = new Scanner();

      // Mock readdir for root
      vi.mocked(readdir).mockResolvedValueOnce([
        {
          name: 'file1.txt',
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false,
        },
        {
          name: 'subdir',
          isFile: () => false,
          isDirectory: () => true,
          isSymbolicLink: () => false,
        },
      ] as any);

      // Mock readdir for subdir
      vi.mocked(readdir).mockResolvedValueOnce([
        {
          name: 'file2.txt',
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false,
        },
      ] as any);

      // Mock stat for files
      vi.mocked(stat).mockResolvedValue({ size: 100 } as any);

      const files = await scanner.scan('/test', []);

      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('file1');
      expect(files[1].name).toBe('file2');
      expect(readdir).toHaveBeenCalledTimes(2);
    });

    it('should skip symbolic links', async () => {
      const scanner = new Scanner();

      vi.mocked(readdir).mockResolvedValue([
        {
          name: 'link',
          isFile: () => false,
          isDirectory: () => false,
          isSymbolicLink: () => true,
        },
        {
          name: 'file.txt',
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false,
        },
      ] as any);

      vi.mocked(stat).mockResolvedValue({ size: 100 } as any);

      const files = await scanner.scan('/test', []);

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('file');
    });

    it('should handle readdir errors', async () => {
      const scanner = new Scanner();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.mocked(readdir).mockRejectedValue(new Error('Read error'));

      const files = await scanner.scan('/test', []);

      expect(files).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error scanning directory'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should handle stat errors', async () => {
      const scanner = new Scanner();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.mocked(readdir).mockResolvedValue([
        {
          name: 'file.txt',
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false,
        },
      ] as any);
      vi.mocked(stat).mockRejectedValue(new Error('Stat error'));

      const files = await scanner.scan('/test', []);

      expect(files).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should not log EACCES or EPERM errors', async () => {
      const scanner = new Scanner();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.mocked(readdir).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      await scanner.scan('/test', []);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should trigger progress callback', async () => {
      const scanner = new Scanner();
      const progressCallback = vi.fn();

      vi.mocked(readdir).mockResolvedValue([
        {
          name: 'file1.txt',
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false,
        },
      ] as any);
      vi.mocked(stat).mockResolvedValue({ size: 100 } as any);

      // Force progress update by mocking Date.now
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 1000);

      await scanner.scan('/test', [], progressCallback);

      expect(progressCallback).toHaveBeenCalled();
    });
  });
});
