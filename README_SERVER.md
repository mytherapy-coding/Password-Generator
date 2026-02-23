# Running the Password Generator

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

## Stop the Server

Press `Ctrl + C` in the terminal

## Why?

Modern browsers block ES modules (`import`/`export`) when loading files directly from the file system (`file://` protocol) for security reasons. Running a local web server uses the `http://` protocol, which allows ES modules to work correctly.
