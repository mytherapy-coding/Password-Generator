#!/bin/bash
cd /Users/alena/Password-Generator

echo "📋 Checking git status..."
git status --short

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Add test scripts and deployment documentation

- Add test-and-deploy.sh for automated testing
- Add DEPLOY.md with deployment instructions
- Add helper scripts for git operations"

echo ""
echo "🚀 Pushing to remote..."
git push

echo ""
echo "✅ Done! GitHub Actions will now build and deploy to Pages."
