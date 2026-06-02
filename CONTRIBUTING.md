# Contributing to Similar Files Detector

First off, thank you for considering contributing to Similar Files Detector! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by a simple principle: **Be respectful and constructive**. By participating, you are expected to uphold this standard.

## Getting Started

- Make sure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed
- Fork the repository on GitHub
- Clone your fork locally
- Create a branch for your contribution

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (file names, sizes, configurations)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, Node version, pnpm version)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **A clear and descriptive title**
- **A detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Provide examples** of how it would work

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improvements to documentation

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/yourusername/similar-files.git
   cd similar-files
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the project**

   ```bash
   pnpm build
   ```

4. **Run tests**

   ```bash
   pnpm test
   ```

5. **Run linting**
   ```bash
   pnpm lint
   ```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all code
- **Explicit typing** - Avoid `any` unless absolutely necessary
- **Functional approach** - Prefer pure functions and immutability
- **Clear naming** - Use descriptive variable and function names

### Code Style

- **Formatting** - Run `pnpm prettier:fix` before committing
- **Linting** - Run `pnpm lint:fix` to fix linting issues
- **No console.log** - Use proper error handling instead (except for user-facing output)
- **Minimal comments** - Code should be self-documenting; add comments only for non-obvious logic

### File Organization

```
src/
├── core/           # Core business logic
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── __tests__/      # Test files (colocated with source)
```

### Example Code Style

```typescript
export function areSimilar(fileA: FileInfo, fileB: FileInfo, tolerance: number): boolean {
  if (fileA.path === fileB.path) {
    return false;
  }
  if (fileA.extension !== fileB.extension) {
    return false;
  }
  const nameMatch = fileA.name.includes(fileB.name) || fileB.name.includes(fileA.name);
  if (!nameMatch) {
    return false;
  }
  const sizeDiff = Math.abs(fileA.size - fileB.size);
  return sizeDiff <= tolerance;
}
```

## Testing Guidelines

### Writing Tests

- **Test files** - Place in `__tests__` directories next to source files
- **Naming** - Use `.test.ts` suffix (e.g., `comparator.test.ts`)
- **Coverage** - Aim for high test coverage of business logic
- **Unit tests** - Test individual functions in isolation
- **Mock external dependencies** - Use Vitest mocks for file system operations

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { Comparator } from '../comparator';
import { FileInfo } from '../../types';

describe('Comparator', () => {
  const comparator = new Comparator();

  describe('areSimilar', () => {
    it('should return true when files are similar', () => {
      const fileA = createFileInfo('/path/Or.txt', 'Or', '.txt', 1000);
      const fileB = createFileInfo('/path/Or (1).txt', 'Or (1)', '.txt', 1050);
      expect(comparator.areSimilar(fileA, fileB, 100)).toBe(true);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test comparator.test.ts
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```
feat(comparator): add case-sensitive name matching

Implemented case-sensitive name comparison to distinguish
between files like "File.txt" and "file.txt".

Closes #123
```

```
fix(scanner): handle symbolic links correctly

Skip symbolic links during scanning to prevent infinite loops
and incorrect duplicate detection.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update tests** - Add/update tests for your changes
2. **Run the test suite** - `pnpm test`
3. **Run linting** - `pnpm lint:fix`
4. **Run formatting** - `pnpm prettier:fix`
5. **Update documentation** - If you changed functionality
6. **Test manually** - Run the tool with your changes

### Submitting

1. **Push your branch** to your fork
2. **Open a Pull Request** against the `main` branch
3. **Fill in the PR template** with all relevant details
4. **Link related issues** using "Fixes #123" or "Closes #456"

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Added/updated tests
- [ ] Tested manually with sample data

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

- **Code review** - Maintainers will review your PR
- **Feedback** - Address any requested changes
- **Approval** - Once approved, your PR will be merged
- **Credit** - You'll be credited in the release notes!

## Development Tips

### Testing Locally

```bash
# Test in dry mode (safe)
pnpm start

# Test with sample data
# 1. Edit src/settings.ts and point to test-data directory
# 2. Run the tool
pnpm start

# Test actual deletion (be careful!)
# Edit src/settings.ts: dryMode = false
pnpm start
```

### Debugging

```bash
# Run with debugging
node --inspect-brk node_modules/.bin/tsx src/main.ts
```

### Performance Testing

```bash
# Measure execution time
time pnpm start
```

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing!

## Recognition

Contributors will be recognized in:

- Release notes
- README.md (if significant contribution)
- GitHub contributors page

Thank you for making Similar Files Detector better! 🎉
