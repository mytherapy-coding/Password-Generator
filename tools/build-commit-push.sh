#!/bin/bash
set -e

cd /Users/alena/Password-Generator

echo "🔨 Step 1: Building project..."
npm run build

echo ""
echo "✅ Build complete! Checking git status..."
git status --short

echo ""
echo "📦 Step 2: Adding all changes..."
git add .

echo ""
echo "💾 Step 3: Committing changes..."
git commit -m "Remove duplicate workflow, keep pages.yml

- Delete deploy.yml (duplicate)
- Keep pages.yml as single workflow
- Build project"

echo ""
echo "🚀 Step 4: Pushing to remote..."
git push

echo ""
echo "✅ Done! GitHub Actions will now build and deploy to Pages."
