#!/usr/bin/env node

import { execSync } from 'child_process';

const projectRoot = process.cwd();

console.log('📦 Adding all changes...');
try {
  execSync('git add -A', { stdio: 'inherit', cwd: projectRoot });
} catch (error) {
  console.error('❌ Git add failed:', error.message);
  process.exit(1);
}

console.log('\n💾 Creating commit...');
const commitMessage = `Organize documentation: move all .md files to docs/ folder

- Move all markdown files except README.md to docs/ folder
- Consolidate deployment docs into docs/DEPLOYMENT.md
- Consolidate troubleshooting docs into docs/TROUBLESHOOTING.md
- Rename README_SERVER.md to docs/DEVELOPMENT.md
- Create docs/README.md as documentation index
- Remove outdated documentation files
- Keep README.md in root as main project entry point`;

try {
  execSync(`git commit -m ${JSON.stringify(commitMessage)}`, { 
    stdio: 'inherit', 
    cwd: projectRoot 
  });
  console.log('\n✅ Commit created successfully!');
} catch (error) {
  if (error.message.includes('nothing to commit')) {
    console.log('ℹ️  Nothing to commit (working tree clean)');
  } else {
    console.error('❌ Git commit failed:', error.message);
    process.exit(1);
  }
}
