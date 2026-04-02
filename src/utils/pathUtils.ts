export function shouldIgnorePath(fullPath: string, ignorePatterns: string[]): boolean {
  if (ignorePatterns.length === 0) {
    return false;
  }
  const lowerPath = fullPath.toLowerCase();
  return ignorePatterns.some((pattern: string) => lowerPath.includes(pattern.toLowerCase()));
}
