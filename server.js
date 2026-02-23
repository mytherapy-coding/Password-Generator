#!/usr/bin/env node
// Simple HTTP server for local development
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".ts": "text/typescript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  // Serve from dist/ if it exists (built version), otherwise serve from root (development)
  const distExists = fs.existsSync("./dist");
  const basePath = distExists ? "./dist" : ".";
  
  let filePath = basePath + req.url;
  if (filePath === basePath + "/" || filePath === basePath) {
    filePath = basePath + "/index.html";
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - File Not Found</h1>", "utf-8");
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, "utf-8");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  const distExists = fs.existsSync("./dist");
  console.log(`Server running at http://localhost:${PORT}/`);
  if (distExists) {
    console.log("✓ Serving from dist/ (built version)");
  } else {
    console.log("⚠ WARNING: dist/ does not exist!");
    console.log("  Browsers cannot execute TypeScript files.");
    console.log("  Run 'npm run build' to compile TypeScript to JavaScript.");
  }
  console.log("Press Ctrl+C to stop the server");
});
