import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';

const cache = new Map<string, number>();

function computeInsertionTime(relPath: string): number {
  try {
    const out = execSync(`git log --follow --diff-filter=A --format=%at -- ${JSON.stringify(relPath)}`, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    const lines = out.split('\n').filter(Boolean);
    if (lines.length > 0) {
      return Number(lines[lines.length - 1]) * 1000;
    }
  } catch {
    // git not available, not a repo, or file not tracked yet
  }
  try {
    return statSync(path.resolve(process.cwd(), relPath)).birthtimeMs;
  } catch {
    return 0;
  }
}

function insertionTime(relPath: string | undefined): number {
  if (!relPath) return 0;
  if (!cache.has(relPath)) {
    cache.set(relPath, computeInsertionTime(relPath));
  }
  return cache.get(relPath)!;
}

/** Sorts collection entries by when they were first added to the repo, newest first. */
export function byInsertionDesc<T extends { filePath?: string }>(a: T, b: T): number {
  return insertionTime(b.filePath) - insertionTime(a.filePath);
}
