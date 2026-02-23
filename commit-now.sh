#!/bin/bash
cd /Users/alena/Password-Generator

echo "📋 Checking git status..."
git status --short

echo ""
echo "📦 Adding all changes..."
git add -A

echo ""
echo "💾 Creating commit..."
git commit -m "Remove old JavaScript files, migrate to TypeScript-only

- Remove all old .js files from cli/, core/, js/, data/ directories
- Remove root script.js (now built from TypeScript)
- Project is now fully TypeScript-based
- Add documentation files for deployment and testing
- All source code now in src/core/, src/web/, and cli/"

echo ""
echo "✅ Commit created!"
echo ""
echo "To push: git push"
