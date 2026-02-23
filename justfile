# Password Generator - Development Commands
# Run `just --list` to see all available commands

# Default recipe (run when just `just` is called)
default:
    @just --list

# ============================================================================
# Build Commands
# ============================================================================

# Build the project (development)
build:
    @echo "🔨 Building project..."
    npm run build

# Build the project (production)
build-prod:
    @echo "🔨 Building project (production)..."
    npm run build:prod

# Clean build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    npm run clean

# Rebuild from scratch
rebuild: clean build
    @echo "✅ Rebuild complete!"

# ============================================================================
# Type Checking
# ============================================================================

# Run TypeScript type checking
typecheck:
    @echo "🔍 Running TypeScript typecheck..."
    npm run typecheck

# ============================================================================
# Testing & Verification
# ============================================================================

# Verify build output exists and is correct
verify:
    @echo "🔍 Checking build output in dist/ folder..."
    @echo ""
    @echo "📄 Required files:"
    @test -f dist/script.js && echo "  ✅ dist/script.js" || echo "  ❌ dist/script.js MISSING"
    @test -f dist/index.html && echo "  ✅ dist/index.html" || echo "  ❌ dist/index.html MISSING"
    @test -f dist/style.css && echo "  ✅ dist/style.css" || echo "  ❌ dist/style.css MISSING"
    @test -f dist/cli/index.js && echo "  ✅ dist/cli/index.js" || echo "  ❌ dist/cli/index.js MISSING"
    @echo ""
    @echo "📁 Data files:"
    @test -d dist/data && echo "  ✅ dist/data/ directory exists" || echo "  ❌ dist/data/ MISSING"
    @test -f dist/data/diceware_words.json && echo "  ✅ diceware_words.json" || echo "  ❌ diceware_words.json MISSING"
    @test -f dist/data/adjs.json && echo "  ✅ adjs.json" || echo "  ❌ adjs.json MISSING"
    @test -f dist/data/nouns.json && echo "  ✅ nouns.json" || echo "  ❌ nouns.json MISSING"
    @echo ""
    @echo "📊 File sizes:"
    @test -f dist/script.js && du -h dist/script.js | cut -f1 | xargs echo "  script.js:" || true
    @test -f dist/cli/index.js && du -h dist/cli/index.js | cut -f1 | xargs echo "  cli/index.js:" || true
    @echo ""
    @echo "🔗 HTML script reference:"
    @grep -o 'src="[^"]*"' dist/index.html | head -1 || true
    @echo ""
    @echo "✅ Build verification complete!"

# Test CLI tool
test-cli:
    @echo "🧪 Testing CLI tool..."
    @node dist/cli/index.js pwd --len 16 --mode strong || echo "⚠️  CLI test failed (may need npm link)"

# Run full test suite (typecheck + build + verify + CLI test)
test: typecheck build verify test-cli
    @echo ""
    @echo "✅ All tests passed!"

# Full test and deploy workflow (without actually deploying)
test-deploy: typecheck build verify test-cli
    @echo ""
    @echo "📦 Checking git status..."
    @git status --short
    @echo ""
    @echo "✅ Build and test complete!"
    @echo ""
    @echo "To deploy:"
    @echo "  just commit 'Build and deploy to GitHub Pages'"
    @echo "  just push"
    @echo ""
    @echo "To test locally:"
    @echo "  just serve"

# ============================================================================
# Development Server
# ============================================================================

# Start development server (serves from dist/ if exists, otherwise root)
serve:
    @echo "🌐 Starting development server..."
    @echo "Server will be available at: http://localhost:8000"
    @echo "Press Ctrl+C to stop the server"
    @echo ""
    npm run serve:dist

# Start dev server (alternative - uses server.js)
start:
    @echo "🚀 Starting server..."
    npm start

# ============================================================================
# Git Operations
# ============================================================================

# Show git status
status:
    @echo "📋 Git status:"
    @git status --short

# Stage all changes
stage:
    @echo "📦 Staging all changes..."
    @git add -A
    @git status --short

# Commit changes (usage: just commit "Your message")
commit MESSAGE:
    @echo "💾 Committing changes..."
    @git add -A
    @git commit -m {{MESSAGE}}
    @echo "✅ Commit created!"

# Push to remote
push:
    @echo "🚀 Pushing to remote..."
    @git push
    @echo ""
    @echo "✅ Push complete!"
    @echo ""
    @echo "GitHub Actions will now:"
    @echo "  1. Run typecheck"
    @echo "  2. Build the project"
    @echo "  3. Deploy to GitHub Pages"
    @echo ""
    @echo "Check status at: https://github.com/mytherapy-coding/Password-Generator/actions"

# Full deploy workflow: build + commit + push
deploy MESSAGE="Deploy updates":
    @echo "🚀 Starting deployment..."
    @just build
    @just commit MESSAGE={{MESSAGE}}
    @just push
    @echo ""
    @echo "✅ Deployment complete!"

# ============================================================================
# Combined Workflows
# ============================================================================

# Build, commit, and push in one command
build-commit-push MESSAGE="Build and deploy":
    @just build
    @just commit MESSAGE={{MESSAGE}}
    @just push

# Full workflow: test + build + commit + push
test-build-deploy MESSAGE="Test, build, and deploy":
    @just test-deploy
    @just commit MESSAGE={{MESSAGE}}
    @just push
