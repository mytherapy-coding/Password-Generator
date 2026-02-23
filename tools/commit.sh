#!/bin/bash
cd /Users/alena/Password-Generator
git add -A
git commit -m "Organize documentation: move all .md files to docs/ folder

- Move all markdown files except README.md to docs/ folder
- Consolidate deployment docs into docs/DEPLOYMENT.md
- Consolidate troubleshooting docs into docs/TROUBLESHOOTING.md
- Rename README_SERVER.md to docs/DEVELOPMENT.md
- Create docs/README.md as documentation index
- Remove outdated documentation files
- Keep README.md in root as main project entry point"
echo "✅ Commit created! Now run: git push"
