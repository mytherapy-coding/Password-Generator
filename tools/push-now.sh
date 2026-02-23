#!/bin/bash
cd /Users/alena/Password-Generator

echo "🚀 Pushing to remote..."
git push

echo ""
echo "✅ Push complete!"
echo ""
echo "GitHub Actions will now:"
echo "  1. Run typecheck"
echo "  2. Build the project"
echo "  3. Deploy to GitHub Pages"
echo ""
echo "Check status at: https://github.com/mytherapy-coding/Password-Generator/actions"
