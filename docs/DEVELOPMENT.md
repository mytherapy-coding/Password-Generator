# Development Guide

## Running the Password Generator Locally

## CORS Error Fix

If you see a CORS error when opening `index.html` directly, you need to run a local web server.

## Quick Start

### Option 1: Using npm script (Recommended)

```bash
npm start
```

Then open: **http://localhost:8000**

### Option 2: Using Python

```bash
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

### Option 3: Using Node directly

```bash
node server.js
```

Then open: **http://localhost:8000**

### Option 4: Serve Built Version

```bash
npm run build
npm run serve:dist
```

Then open the URL shown (usually `http://localhost:3000`)

## Stop the Server

Press `Ctrl + C` in the terminal

## Why?

Modern browsers block ES modules (`import`/`export`) when loading files directly from the file system (`file://` protocol) for security reasons. Running a local web server uses the `http://` protocol, which allows ES modules to work correctly.

## Development Workflow

1. **Make changes** to source files in `src/` or `cli/`
2. **Typecheck**: `npm run typecheck`
3. **Build**: `npm run build`
4. **Test**: `npm run serve:dist`
5. **Commit**: `git add . && git commit -m "..." && git push`

## Project Structure

- `src/core/` - Core logic (pure functions, no DOM/Node dependencies)
- `src/web/` - Web app code (DOM manipulation, browser APIs)
- `cli/` - CLI tool code (Node.js specific)
- `data/` - Data files (JSON word lists)
- `dist/` - Build output (generated, gitignored)
