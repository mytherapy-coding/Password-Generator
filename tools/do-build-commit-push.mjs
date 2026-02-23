#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const projectRoot = '/Users/alena/Password-Generator';

process.chdir(projectRoot);

console.log('🔨 Step 1: Building project...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n📦 Step 2: Adding all changes...');
try {
  execSync('git add .', { stdio: 'inherit', cwd: projectRoot });
} catch (error) {
  console.error('❌ Git add failed:', error.message);
  process.exit(1);
}

console.log('\n💾 Step 3: Committing changes...');
try {
  execSync('git commit -m "Remove duplicate workflow, keep pages.yml\n\n- Delete deploy.yml (duplicate)\n- Keep pages.yml as single workflow\n- Build project"', { stdio: 'inherit', cwd: projectRoot });
} catch (error) {
  // Commit might fail if there's nothing to commit
  if (error.message.includes('nothing to commit')) {
    console.log('ℹ️  Nothing to commit (working tree clean)');
  } else {
    console.error('❌ Git commit failed:', error.message);
    process.exit(1);
  }
}

console.log('\n🚀 Step 4: Pushing to remote...');
try {
  execSync('git push', { stdio: 'inherit', cwd: projectRoot });
  console.log('\n✅ Done! GitHub Actions will now build and deploy to Pages.');
} catch (error) {
  console.error('❌ Git push failed:', error.message);
  process.exit(1);
}
