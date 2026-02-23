#!/usr/bin/env node

import { mkdirSync, renameSync, readdirSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const docsDir = join(rootDir, 'docs');

// Create docs directory
mkdirSync(docsDir, { recursive: true });

// List of markdown files to move (excluding README.md)
const mdFilesToMove = [
  'CHECK_WORKFLOW_STATUS.md',
  'CLI_USAGE.md',
  'DEPLOY.md',
  'FIX_CACHE.md',
  'FIX_PAGES_DEPLOYMENT.md',
  'GITHUB_PAGES_SETUP.md',
  'PROJECT_STATUS.md',
  'QUICK_START.md',
  'README_SERVER.md',
  'REFACTORING.md',
  'REMOVED_OLD_JS.md',
  'TESTING.md',
  'WHICH_WORKFLOW.md'
];

console.log('Moving markdown files to docs/...');

let moved = 0;
let skipped = 0;

for (const file of mdFilesToMove) {
  const sourcePath = join(rootDir, file);
  const destPath = join(docsDir, file);
  
  try {
    renameSync(sourcePath, destPath);
    console.log(`✓ Moved ${file}`);
    moved++;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⊘ Skipped ${file} (not found)`);
      skipped++;
    } else {
      console.error(`✗ Error moving ${file}:`, error.message);
    }
  }
}

console.log(`\nDone! Moved ${moved} files, skipped ${skipped} files.`);
console.log(`README.md remains in root as requested.`);
