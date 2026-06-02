# Similar Files Detector — Developer Instructions

This document provides detailed instructions for developers working on the Similar Files Detector project.

## Last Updated

- **Date**: 2026-06-02
- **Version**: 1.0.0

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Available Commands](#available-commands)
- [Development Workflow](#development-workflow)
- [Module Documentation](#module-documentation)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Extending the Application](#extending-the-application)
- [External Resources](#external-resources)

## Project Overview

### Purpose

Similar Files Detector is a TypeScript CLI tool designed to identify and optionally delete similar files within a directory tree. It uses name containment, file extensions, and size tolerance to find potential duplicates.

### Target Users

- Developers and power users needing to clean up redundant files.
- Users looking for a safe, interactive duplicate file management tool.
- Anyone managing large datasets where naming patterns suggest duplication.

### Key Goals

1. **Safety** — Default to dry mode; require explicit confirmation for deletions.
2. **Efficiency** — Handle 100k+ files by grouping by extension and using optimized comparison logic.
3. **Cross-platform** — Seamless operation on Windows, macOS, and Linux.
4. **Transparency** — Provide real-time progress updates and detailed final statistics.
5. **Configurability** — Allow fine-tuning of size tolerance and ignore patterns.

## Architecture

### High-Level Design

```
User Settings (src/settings.ts)
        ↓
    main.ts (Orchestrator)
        ↓
    core/scanner.ts (Recursive File Tree Traversal)
        ↓
    core/comparator.ts (Similarity Logic)
        ↓
    core/duplicateFinder.ts (Grouping & Union-Find)
        ↓
    core/deleter.ts (Interactive Deletion)
        ↓
    core/statistics.ts (Data Aggregation)
```

### Module Responsibilities

| Module                    | Responsibility                               | Key exports                              |
| ------------------------- | -------------------------------------------- | ---------------------------------------- |
| `main.ts`                 | Entry point, CLI flow control                | `main()`                                 |
| `settings.ts`             | Configuration (scanPath, tolerance, dryMode) | `settings`                               |
| `core/scanner.ts`         | Recursively finds all files in a directory   | `scanDirectory()`                        |
| `core/comparator.ts`      | Logic to decide if two files are similar     | `areFilesSimilar()`                      |
| `core/duplicateFinder.ts` | Groups similar files into sets               | `findDuplicates()`                       |
| `core/deleter.ts`         | Handles deletion with user prompts           | `deleteDuplicates()`                     |
| `core/statistics.ts`      | Formats and displays final results           | `displayStatistics()`                    |
| `utils/pathUtils.ts`      | Path manipulation and ignore pattern checks  | `isIgnored()`, `getRelativePath()`       |
| `utils/formatUtils.ts`    | Number and byte formatting                   | `formatBytes()`, `formatNumber()`        |
| `types/index.ts`          | Shared TypeScript interfaces                 | `Settings`, `FileInfo`, `DuplicateGroup` |

### Data Flow

1. **Scan Phase**: `scanner.ts` walks the directory tree starting at `settings.scanPath`, ignoring anything in `settings.ignorePaths`. It collects `FileInfo` for every valid file.
2. **Comparison Phase**: Files are first grouped by extension. Within each extension group, `duplicateFinder.ts` uses `comparator.ts` to check every pair against `settings.sizeToleranceBytes` and name containment rules.
3. **Grouping**: A Union-Find algorithm (or similar transitive grouping) ensures that if A ~ B and B ~ C, then {A, B, C} are all in one duplicate group.
4. **Interactive Deletion**: In non-dry mode, `deleter.ts` presents each group to the user, who chooses whether to delete the redundant files.
5. **Statistics**: `statistics.ts` summarizes total files, space saved, and any errors encountered.

## Setup Instructions

## Setup and Usage Instructions

To get started with development:

1. **Clone the Repository**: `git clone <repo-url>`
2. **Install Dependencies**: Run `pnpm install`.
3. **Build**: Run `pnpm build`.
4. **Test**: Run `pnpm test` to ensure everything is working.
5. **Configure**: Adjust `src/settings.ts` as needed.
6. **Run**: Execute `pnpm start` for a dry run.

## System Requirements

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **RAM**: 1GB minimum
- **OS**: Windows, macOS, or Linux

### Prerequisites

- **Node.js** v18.0.0 or higher
- **pnpm** v8.0.0 or higher
- **Git** (optional, recommended for version control)

### Initial Setup

## Install Dependencies

```bash
pnpm install
```

```bash
# 1. Clone the repository (if applicable)
git clone https://github.com/orassayag/similar-files-github.git
cd similar-files-github

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm build

# 4. Verify setup
pnpm test
pnpm lint
```

### IDE Configuration

#### VS Code (Recommended)

Essential extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Available Commands

The following commands are available for development and execution.

### Development Commands

- `pnpm build`: Compiles TypeScript to JavaScript in `dist/`.
- `pnpm lint`: Runs ESLint to check for code quality issues.
- `pnpm format`: Runs Prettier to format the codebase.
- `pnpm test`: Executes all unit tests once.
- `pnpm test:watch`: Runs tests in watch mode for active development.

### Running Scripts

- `pnpm start`: Runs the application using the current settings in `src/settings.ts`.
- `node dist/main.js`: Runs the production build.

## Development Workflow

### Daily Development

```bash
# 1. Update your local copy
git pull origin main

# 2. Work on a branch
git checkout -b feature/your-improvement

# 3. Development loop
pnpm test:watch  # Keep tests running
# ... edit code ...

# 4. Build and Verify
pnpm build
pnpm test
pnpm lint
```

### Adding a New Feature

1. **Modify Types**: Update `src/types/index.ts` if adding configuration or new data structures.
2. **Implement**: Add logic to the appropriate module in `src/core/` or `src/utils/`.
3. **Write Tests**: Create or update `__tests__` within the module's directory.
4. **Update README/INSTRUCTIONS**: Reflect any changes in behavior or configuration options.

### Making a Bug Fix

1. **Reproduce**: Create a failing test in `__tests__` that captures the bug.
2. **Fix**: Apply the minimal change required to fix the issue.
3. **Verify**: Ensure all tests (including the new one) pass.

## Module Documentation

### Scanner (`src/core/scanner.ts`)

Uses standard `fs` promises. Handles permission errors gracefully by logging a warning and continuing. Skips symbolic links.

### Comparator (`src/core/comparator.ts`)

The "brain" of the similarity logic.

- Extension Match: `extname(fileA) === extname(fileB)`
- Size Tolerance: `abs(sizeA - sizeB) <= tolerance`
- Name Containment: `nameA.includes(nameB) || nameB.includes(nameA)`

### Statistics (`src/core/statistics.ts`)

Calculates:

- Scanned count
- Similar groups count
- Duplicate files count
- Potential space saved (sum of sizes of all files in groups minus the one 'kept' file per group)

## Testing Strategy

### Test Organization

We use **Vitest** for unit testing. Tests are located alongside the source code in `__tests__` folders.

```
src/
├── core/
│   ├── scanner.ts
│   └── __tests__/
│       └── scanner.test.ts
└── utils/
    ├── pathUtils.ts
    └── __tests__/
        └── pathUtils.test.ts
```

### Test Categories

1. **Unit tests**: Isolated tests for logic-heavy modules like `comparator.ts` and `pathUtils.ts`.
2. **Integration tests**: Using `test-data/` to verify the full flow (scan -> find -> report).

### Running Tests

```bash
pnpm test           # Run all tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Generate coverage report
```

### Mocking Guidelines

- Mock the filesystem when testing `scanner.ts` or `deleter.ts` to avoid modifying actual files.
- Use `vi.spyOn(console, ...)` to verify output/warnings without cluttering the test console.

## Deployment

### Building for Production

```bash
pnpm build
```

This generates the JavaScript code in the `dist/` directory.

### Running the Production Build

```bash
node dist/main.js
```

### Release Process

1. **Version bump**: `npm version patch` (or minor/major)
2. **Test**: `pnpm build && pnpm test && pnpm lint`
3. **Push tags**: `git push origin main --tags`

## Troubleshooting

### "Progress seems stuck"

This usually happens when scanning very large volumes or network drives. Check if `ignorePaths` is covering large system folders like `node_modules`.

### "Permissions errors"

Ensure you have read access to the `scanPath`. The tool will report specific files it cannot access.

### "No duplicates found"

- Verify that `sizeToleranceBytes` is high enough.
- Ensure extensions are exactly the same (case-insensitive in some OS, but tool handles them specifically).
- Check if `ignorePaths` is too broad.

## Best Practices

### Code Quality

- **Type Safety**: Never use `any`. Define interfaces in `src/types/index.ts`.
- **Pure Functions**: Keep utility functions pure for easier testing.
- **Error Handling**: Always catch and surface filesystem errors with meaningful messages.

### Security

- **Dry Mode**: Always default `dryMode` to `true` in code and documentation.
- **Path Validation**: Use `path.resolve` and `path.normalize` to ensure paths remain within intended boundaries.

## Extending the Application

To add new functionality:

1. **New Similarity Logic**: Modify `src/core/comparator.ts` to add or refine comparison rules.
2. **New Ignore Patterns**: Update `src/utils/pathUtils.ts` or add to `settings.ignorePaths`.
3. **New CLI Features**: Enhance `src/main.ts` or add a new module in `src/core/` to handle more complex scenarios.

## External Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [pnpm Documentation](https://pnpm.io/motivation)
- [Vitest Guide](https://vitest.dev/guide/)

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
