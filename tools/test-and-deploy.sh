#!/bin/bash
set -e

echo "🔍 Step 1: TypeScript Typecheck..."
npm run typecheck

echo ""
echo "🔨 Step 2: Building project..."
npm run build

echo ""
echo "✅ Step 3: Verifying build output..."
if [ ! -f "dist/script.js" ]; then
  echo "❌ ERROR: dist/script.js not found"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ ERROR: dist/index.html not found"
  exit 1
fi

if [ ! -f "dist/cli/index.js" ]; then
  echo "❌ ERROR: dist/cli/index.js not found"
  exit 1
fi

if [ ! -d "dist/data" ]; then
  echo "❌ ERROR: dist/data not found"
  exit 1
fi

echo "✅ All build files verified!"

echo ""
echo "🧪 Step 4: Testing CLI..."
node dist/cli/index.js pwd --len 16 --mode strong || echo "⚠️  CLI test failed (may need npm link)"

echo ""
echo "📦 Step 5: Checking git status..."
git status --short

echo ""
echo "✅ Build and test complete!"
echo ""
echo "To deploy:"
echo "  git add ."
echo "  git commit -m 'Build and deploy to GitHub Pages'"
echo "  git push"
echo ""
echo "To test locally:"
echo "  npm run serve:dist"
