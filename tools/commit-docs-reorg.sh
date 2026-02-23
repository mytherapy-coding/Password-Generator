#!/bin/bash
cd /Users/alena/Password-Generator

echo "📋 Checking git status..."
git status --short

echo ""
echo "📦 Adding all changes..."
git add -A

echo ""
echo "💾 Creating commit..."
git commit -m "Organize documentation: move all .md files to docs/ folder

- Move all markdown files except README.md to docs/ folder
- Consolidate deployment docs into docs/DEPLOYMENT.md
- Consolidate troubleshooting docs into docs/TROUBLESHOOTING.md
- Rename README_SERVER.md to docs/DEVELOPMENT.md
- Create docs/README.md as documentation index
- Remove outdated documentation files
- Keep README.md in root as main project entry point

Documentation structure:
- docs/DEPLOYMENT.md - GitHub Pages deployment guide
- docs/DEVELOPMENT.md - Local development setup
- docs/TESTING.md - Testing guide
- docs/CLI_USAGE.md - CLI tool usage
- docs/TROUBLESHOOTING.md - Common issues and solutions
- docs/QUICK_START.md - Quick start guide
- docs/CHECK_WORKFLOW_STATUS.md - Workflow status guide"

echo ""
echo "✅ Commit created!"
echo ""
echo "To push: git push"
