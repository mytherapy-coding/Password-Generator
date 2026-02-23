#!/bin/bash
cd /Users/alena/Password-Generator

echo "📋 Checking git status..."
git status --short

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Add GitHub Pages deployment documentation

- Add FIX_PAGES_DEPLOYMENT.md
- Add WHICH_WORKFLOW.md
- Add CHECK_WORKFLOW_STATUS.md
- Add GITHUB_PAGES_SETUP.md"

echo ""
echo "🚀 Pushing to remote..."
git push

echo ""
echo "✅ Done! GitHub Actions will now build and deploy to Pages."
