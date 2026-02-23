# 🚀 Quick Start Guide

## The Problem
You're getting a CORS error because you're opening the file directly. You need to run a web server.

## ✅ Solution: Run the Server

### Method 1: Using the Start Script (Easiest)

1. Open **Terminal** on your Mac
2. Run this command:
   ```bash
   cd /Users/alena/Password-Generator
   ./START_SERVER.sh
   ```

### Method 2: Using npm

1. Open **Terminal**
2. Run:
   ```bash
   cd /Users/alena/Password-Generator
   npm start
   ```

### Method 3: Using Python

1. Open **Terminal**
2. Run:
   ```bash
   cd /Users/alena/Password-Generator
   python3 -m http.server 8000
   ```

### Method 4: Using Node directly

1. Open **Terminal**
2. Run:
   ```bash
   cd /Users/alena/Password-Generator
   node server.js
   ```

## 🌐 After Starting the Server

1. You should see: `Server running at http://localhost:8000/`
2. Open your browser (Chrome, Safari, or Firefox)
3. Type in the address bar: **http://localhost:8000**
4. Press Enter

## ⚠️ Important

- **DO NOT** double-click `index.html` in Finder
- **DO NOT** drag `index.html` into the browser
- **DO** run the server first, then open `http://localhost:8000`

## 🛑 To Stop the Server

Press `Ctrl + C` in the Terminal window

## ❓ Troubleshooting

**"This site can't be reached"**
- Make sure the server is running (you should see "Server running at..." message)
- Make sure you're opening `http://localhost:8000` (not `file:///...`)
- Check that port 8000 is not already in use

**"Command not found"**
- Make sure you're in the correct directory: `cd /Users/alena/Password-Generator`
- Check that Node.js or Python is installed
