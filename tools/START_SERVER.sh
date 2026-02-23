#!/bin/bash
# Quick start script for the Password Generator server

echo "Starting Password Generator server..."
echo ""
echo "Server will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Try Node.js first, fall back to Python
if command -v node &> /dev/null; then
    node server.js
elif command -v python3 &> /dev/null; then
    python3 -m http.server 8000
else
    echo "Error: Neither Node.js nor Python3 found!"
    echo "Please install Node.js or Python3"
    exit 1
fi
