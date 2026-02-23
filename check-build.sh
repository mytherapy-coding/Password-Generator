#!/bin/bash

echo "🔍 Checking build output in dist/ folder..."
echo ""

# Check key files
echo "📄 Required files:"
[ -f "dist/script.js" ] && echo "  ✅ dist/script.js" || echo "  ❌ dist/script.js MISSING"
[ -f "dist/index.html" ] && echo "  ✅ dist/index.html" || echo "  ❌ dist/index.html MISSING"
[ -f "dist/style.css" ] && echo "  ✅ dist/style.css" || echo "  ❌ dist/style.css MISSING"
[ -f "dist/cli/index.js" ] && echo "  ✅ dist/cli/index.js" || echo "  ❌ dist/cli/index.js MISSING"

echo ""
echo "📁 Data files:"
[ -d "dist/data" ] && echo "  ✅ dist/data/ directory exists" || echo "  ❌ dist/data/ MISSING"
[ -f "dist/data/diceware_words.json" ] && echo "  ✅ diceware_words.json" || echo "  ❌ diceware_words.json MISSING"
[ -f "dist/data/adjs.json" ] && echo "  ✅ adjs.json" || echo "  ❌ adjs.json MISSING"
[ -f "dist/data/nouns.json" ] && echo "  ✅ nouns.json" || echo "  ❌ nouns.json MISSING"

echo ""
echo "📊 File sizes:"
[ -f "dist/script.js" ] && echo "  script.js: $(du -h dist/script.js | cut -f1)"
[ -f "dist/cli/index.js" ] && echo "  cli/index.js: $(du -h dist/cli/index.js | cut -f1)"

echo ""
echo "🔗 HTML script reference:"
grep -o 'src="[^"]*"' dist/index.html | head -1

echo ""
echo "✅ Build verification complete!"
