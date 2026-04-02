# Similar Files Detector

A TypeScript CLI tool that recursively scans directories to identify and optionally delete similar files based on name containment (case-sensitive, same extension) and size tolerance (configurable byte difference).

Built in March 2026, this CLI utility analyzes file patterns, compares sizes within thresholds, flags potential duplicates, and provides interactive or automated cleanup options with detailed reporting for safe and efficient file management.

## Features

- 🔍 **Recursive Scanning**: Scans all files in a directory and its subdirectories
- 📊 **Smart Detection**: Identifies similar files based on:
  - Name similarity (one filename must contain the other, case-sensitive)
  - Same file extension
  - Size tolerance (configurable byte difference)
- 🛡️ **Safety First**: Dry mode by default, per-group deletion confirmation
- 🚫 **Flexible Ignoring**: Skip specific paths (e.g., node_modules, .git)
- 📈 **Real-time Progress**: Live scanning progress with file counts
- 📋 **Comprehensive Statistics**: Detailed reports on duplicates and space savings
- 🗑️ **Safe Deletion**: Interactive confirmation for each group of duplicates

## Installation

```bash
pnpm install
```

## Configuration

Edit `src/settings.ts` to configure the tool:

```typescript
export const settings: Settings = {
  scanPath: '/Users/username/Documents', // Root path to scan
  ignorePaths: ['node_modules', '.git'], // Paths to ignore
  sizeToleranceBytes: 100, // Size difference tolerance
  dryMode: true, // true = no deletion, false = interactive deletion
};
```

### Configuration Options

| Option               | Type     | Default | Description                                                |
| -------------------- | -------- | ------- | ---------------------------------------------------------- |
| `scanPath`           | string   | -       | Root directory to scan recursively                         |
| `ignorePaths`        | string[] | `[]`    | Path patterns to ignore (case-insensitive substring match) |
| `sizeToleranceBytes` | number   | `100`   | Maximum byte difference for files to be considered similar |
| `dryMode`            | boolean  | `true`  | If `true`, only displays results without deleting files    |

## Usage

### Run in Dry Mode (Safe)

```bash
pnpm start
```

This will scan and display similar files without deleting anything.

### Run with Deletion

1. Edit `src/settings.ts` and set `dryMode: false`
2. Run the tool:

```bash
pnpm start
```

3. For each group of similar files, you'll be prompted:
   - `y` or `yes` - Delete duplicates in this group
   - `n` or `no` - Skip this group
   - `q` or `quit` - Cancel entire deletion process

## How Similar Files are Detected

Two files are considered similar if **ALL** of the following conditions are met:

1. ✅ **Same extension**: Files must have identical extensions
2. ✅ **Name containment**: One filename must contain the other (case-sensitive)
3. ✅ **Size similarity**: File sizes must be within the configured tolerance

### Examples

**Similar files** (assuming size within tolerance):

- `Or.txt` ↔ `Or (1).txt` ✅
- `Or.txt` ↔ `Copy of Or.txt` ✅
- `Or.txt` ↔ `Or1.txt` ✅
- `Document.pdf` ↔ `Document (1).pdf` ✅

**NOT similar files**:

- `Or.txt` ↔ `or.txt` ❌ (case-sensitive)
- `Or.txt` ↔ `Or.pdf` ❌ (different extensions)
- `Or.txt` ↔ `File.txt` ❌ (names don't contain each other)
- `Or.txt` ↔ `Or (1).txt` ❌ (if size difference > tolerance)

## Output Example

```
🔍 Similar Files Detector

[DRY MODE] No files will be deleted

Scanning: /Users/username/Documents
Ignoring paths: node_modules, .git
Size tolerance: 100 bytes

Scanning files...
Files scanned: 1,234 | Current: /Users/username/Documents/subfolder/...

✅ Scan completed

Files scanned: 12,421
Similar groups found: 34
Duplicate files: 102
Potential space saved: 512.45 MB

═══════════════════════════════════════
Group #1 (3 files, 3.60 KB)
═══════════════════════════════════════
[KEEP]   /path/to/Original.txt (1,234 bytes)
[DELETE] /path/to/Original (1).txt (1,240 bytes)
[DELETE] /path/to/Copy of Original.txt (1,236 bytes)

Delete 2 files in this group? (y/n/q):
```

## Deletion Strategy

When duplicates are found:

- **First file in group is kept** (based on filesystem traversal order)
- **All other files are marked for deletion**
- In non-dry mode, you confirm deletion for each group
- Failed deletions are tracked and reported

## Safety Features

- ✅ **Dry mode by default** - No accidental deletions
- ✅ **Per-group confirmation** - Review and approve each deletion
- ✅ **Symbolic link protection** - Symbolic links are skipped
- ✅ **Permission handling** - Gracefully handles permission errors
- ✅ **Path validation** - Files must be within scan path
- ✅ **Detailed logging** - All actions are logged
- ✅ **Ignore patterns** - Protect critical directories

## Development

### Build

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Lint

```bash
pnpm lint
```

### Format Code

```bash
pnpm prettier:fix
```

## Project Structure

```
similar-files/
├── src/
│   ├── main.ts              # Entry point and orchestration
│   ├── settings.ts          # Configuration
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── core/
│   │   ├── scanner.ts       # Recursive file scanning
│   │   ├── comparator.ts    # File similarity logic
│   │   ├── duplicateFinder.ts  # Group similar files
│   │   ├── deleter.ts       # File deletion with confirmation
│   │   ├── statistics.ts    # Statistics aggregation and display
│   │   └── __tests__/       # Unit tests
│   └── utils/
│       ├── pathUtils.ts     # Path operations and ignore logic
│       ├── formatUtils.ts   # Number and byte formatting
│       └── __tests__/       # Unit tests
├── test-data/               # Test data directory
├── package.json
├── tsconfig.json
└── README.md
```

## Technical Details

### Performance

- Uses streaming directory traversal for memory efficiency
- Groups files by extension before comparison to reduce complexity
- Union-find algorithm for efficient transitive grouping
- Handles 100k+ files efficiently

### Platform Compatibility

- ✅ macOS
- ✅ Linux
- ✅ Windows

Uses Node.js native `path` module for cross-platform compatibility.

## Common Use Cases

### Clean up download folders

```typescript
{
  scanPath: '/Users/username/Downloads',
  ignorePaths: [],
  sizeToleranceBytes: 0,  // Exact size match
  dryMode: true
}
```

### Clean up photo libraries

```typescript
{
  scanPath: '/Users/username/Photos',
  ignorePaths: ['.photoslibrary'],  // Protect system libraries
  sizeToleranceBytes: 1024,  // 1KB tolerance for metadata differences
  dryMode: true
}
```

### Clean up development projects

```typescript
{
  scanPath: '/Users/username/Projects',
  ignorePaths: ['node_modules', '.git', 'dist', 'build'],
  sizeToleranceBytes: 100,
  dryMode: true
}
```

## Troubleshooting

### No duplicates found but I know they exist

- Check that files have the **same extension**
- Verify names actually contain each other (case-sensitive)
- Check if size difference is within tolerance
- Ensure paths are not in `ignorePaths`

### Permission errors

The tool gracefully handles permission errors and continues scanning. Files that cannot be accessed are skipped with a warning.

### Progress seems stuck

- Large directories take time to scan
- Progress updates every 500ms
- Deep directory structures require more time

## Contributing

Contributions are welcome! Please ensure:

- Tests pass: `pnpm test`
- Linting passes: `pnpm lint`
- Code is formatted: `pnpm prettier:fix`

## Warning

⚠️ **IMPORTANT**: Always run in dry mode first to review what will be deleted. Deleted files cannot be recovered. Use at your own risk.

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag

## License

This application has an MIT license - see the [LICENSE](LICENSE) file for details.
