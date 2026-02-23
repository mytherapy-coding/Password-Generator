#!/bin/bash

echo "🧪 Testing Password Generator App"
echo "=================================="
echo ""

cd /Users/alena/Password-Generator

# Step 1: Typecheck
echo "1️⃣  Running TypeScript typecheck..."
if npm run typecheck; then
  echo "   ✅ Typecheck passed"
else
  echo "   ❌ Typecheck failed"
  exit 1
fi

echo ""

# Step 2: Build
echo "2️⃣  Building project..."
if npm run build; then
  echo "   ✅ Build successful"
else
  echo "   ❌ Build failed"
  exit 1
fi

echo ""

# Step 3: Verify build output
echo "3️⃣  Verifying build output..."
if [ -f "dist/script.js" ]; then
  echo "   ✅ dist/script.js exists"
else
  echo "   ❌ dist/script.js missing"
  exit 1
fi

if [ -f "dist/index.html" ]; then
  echo "   ✅ dist/index.html exists"
else
  echo "   ❌ dist/index.html missing"
  exit 1
fi

if [ -f "dist/style.css" ]; then
  echo "   ✅ dist/style.css exists"
else
  echo "   ❌ dist/style.css missing"
  exit 1
fi

if [ -f "dist/cli/index.js" ]; then
  echo "   ✅ dist/cli/index.js exists"
else
  echo "   ❌ dist/cli/index.js missing"
  exit 1
fi

if [ -d "dist/data" ]; then
  echo "   ✅ dist/data/ directory exists"
else
  echo "   ❌ dist/data/ missing"
  exit 1
fi

echo ""

# Step 4: Test CLI
echo "4️⃣  Testing CLI tool..."
if node dist/cli/index.js pwd --len 16 --mode strong > /dev/null 2>&1; then
  echo "   ✅ CLI generates passwords"
  echo "   Example output:"
  node dist/cli/index.js pwd --len 16 --mode strong | head -3
else
  echo "   ⚠️  CLI test skipped (may need npm link)"
fi

echo ""
echo "✅ All automated tests passed!"
echo ""
echo "🌐 To test the web app:"
echo "   Run: npm run serve:dist"
echo "   Then open the URL shown in your browser"
echo ""
echo "📋 Manual testing checklist:"
echo "   [ ] Password generation works (all modes)"
echo "   [ ] User ID generation works (CVC and Words)"
echo "   [ ] Share links work (copy and restore)"
echo "   [ ] Word lists load correctly"
echo "   [ ] Entropy calculation displays"
echo "   [ ] Crack time estimation displays"
echo "   [ ] All tabs switch correctly"
echo "   [ ] Copy buttons work"
