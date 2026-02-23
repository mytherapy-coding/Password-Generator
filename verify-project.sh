#!/bin/bash

echo "🔍 Verifying Project Structure"
echo "================================"
echo ""

cd /Users/alena/Password-Generator

# Check TypeScript files exist
echo "1️⃣  Checking TypeScript source files..."
if [ -d "src/core" ] && [ -d "src/web" ] && [ -d "cli" ]; then
  echo "   ✅ Source directories exist"
  TS_COUNT=$(find src cli -name "*.ts" | wc -l | tr -d ' ')
  echo "   ✅ Found $TS_COUNT TypeScript files"
else
  echo "   ❌ Missing source directories"
  exit 1
fi

# Check for old JS files (should be none in core/js/cli)
echo ""
echo "2️⃣  Checking for old JavaScript files..."
OLD_JS=$(find cli core js -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
if [ "$OLD_JS" -eq 0 ]; then
  echo "   ✅ No old JS files found in cli/core/js directories"
else
  echo "   ⚠️  Found $OLD_JS old JS files:"
  find cli core js -name "*.js" 2>/dev/null
fi

# Check data files
echo ""
echo "3️⃣  Checking data files..."
if [ -f "data/adjs.json" ] && [ -f "data/nouns.json" ] && [ -f "data/diceware_words.json" ]; then
  echo "   ✅ All data JSON files exist"
else
  echo "   ❌ Missing data files"
  exit 1
fi

# Check build configuration
echo ""
echo "4️⃣  Checking build configuration..."
if [ -f "build.mjs" ] && [ -f "tsconfig.json" ] && [ -f "package.json" ]; then
  echo "   ✅ Build files exist"
else
  echo "   ❌ Missing build configuration"
  exit 1
fi

# Check TypeScript compilation
echo ""
echo "5️⃣  Running TypeScript typecheck..."
if npm run typecheck > /dev/null 2>&1; then
  echo "   ✅ TypeScript compilation successful"
else
  echo "   ❌ TypeScript compilation failed"
  npm run typecheck
  exit 1
fi

# Check build
echo ""
echo "6️⃣  Testing build..."
if npm run build > /dev/null 2>&1; then
  echo "   ✅ Build successful"
else
  echo "   ❌ Build failed"
  npm run build
  exit 1
fi

# Verify build output
echo ""
echo "7️⃣  Verifying build output..."
if [ -f "dist/script.js" ] && [ -f "dist/index.html" ] && [ -f "dist/cli/index.js" ]; then
  echo "   ✅ Build output files exist"
  echo "   ✅ dist/script.js: $(du -h dist/script.js | cut -f1)"
  echo "   ✅ dist/cli/index.js: $(du -h dist/cli/index.js | cut -f1)"
else
  echo "   ❌ Missing build output files"
  exit 1
fi

# Check for empty directories
echo ""
echo "8️⃣  Checking for empty directories..."
if [ -d "core" ] && [ -z "$(ls -A core 2>/dev/null)" ]; then
  echo "   ℹ️  'core/' directory is empty (can be removed)"
fi
if [ -d "js" ] && [ -z "$(ls -A js 2>/dev/null)" ]; then
  echo "   ℹ️  'js/' directory is empty (can be removed)"
fi

echo ""
echo "✅ All checks passed! Project is ready."
