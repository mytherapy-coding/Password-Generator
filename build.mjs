#!/usr/bin/env node

/**
 * Build script using esbuild
 * Compiles TypeScript to JavaScript and bundles for web/CLI
 */

import { build } from "esbuild";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

async function buildWeb() {
  console.log("Building web app...");
  
  await build({
    entryPoints: ["src/web/main.ts"],
    bundle: true,
    outfile: "dist/script.js",
    format: "esm",
    target: "es2020",
    platform: "browser",
    sourcemap: !isProduction,
    minify: isProduction,
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    }
  });
  
  // Copy and update HTML - change script reference to script.js and CSS to style.css
  if (!existsSync("dist")) mkdirSync("dist", { recursive: true });
  let htmlContent = readFileSync("index.html", "utf8");
  htmlContent = htmlContent.replace(
    /<script type="module" src="[^"]*"><\/script>/,
    '<script type="module" src="./script.js"></script>'
  );
  htmlContent = htmlContent.replace(
    /href="\.\/styles\.css"/,
    'href="./style.css"'
  );
  writeFileSync("dist/index.html", htmlContent);
  
  // Copy style.css (note: keeping styles.css name for now, but copying as style.css per requirements)
  if (existsSync("styles.css")) {
    copyFileSync("styles.css", "dist/style.css");
  } else if (existsSync("style.css")) {
    copyFileSync("style.css", "dist/style.css");
  }
  
  // Copy data files
  if (!existsSync("dist/data")) mkdirSync("dist/data", { recursive: true });
  copyFileSync("data/adjs.json", "dist/data/adjs.json");
  copyFileSync("data/nouns.json", "dist/data/nouns.json");
  copyFileSync("data/diceware_words.json", "dist/data/diceware_words.json");
  
  // Copy favicon if exists
  if (existsSync("favicon.png")) {
    copyFileSync("favicon.png", "dist/favicon.png");
  }
  
  console.log("Web app built successfully!");
}

async function buildCLI() {
  console.log("Building CLI...");
  
  await build({
    entryPoints: ["cli/index.ts"],
    bundle: true,
    outfile: "dist/cli/index.js",
    format: "esm",
    target: "node18",
    platform: "node",
    sourcemap: !isProduction,
    minify: isProduction,
    banner: {
      js: "#!/usr/bin/env node"
    }
  });
  
  // Make CLI executable
  const { chmodSync } = await import("fs");
  chmodSync("dist/cli/index.js", 0o755);
  
  console.log("CLI built successfully!");
}

async function buildCore() {
  console.log("Building core library...");
  
  // Core is used by both web and CLI, so we build it separately
  // Web will bundle it, CLI will use it directly
  await build({
    entryPoints: ["src/core/index.ts"],
    bundle: false,
    outdir: "dist/src/core",
    format: "esm",
    target: "es2022",
    platform: "neutral",
    sourcemap: !isProduction,
    minify: false, // Don't minify core, let consumers handle it
  });
  
  console.log("Core library built successfully!");
}

async function main() {
  try {
    // Clean dist directory
    if (existsSync("dist")) {
      const { rmSync } = await import("fs");
      rmSync("dist", { recursive: true, force: true });
    } else {
      mkdirSync("dist", { recursive: true });
    }
    
    mkdirSync("dist", { recursive: true });
    
    // Build in parallel where possible
    await Promise.all([
      buildCore(),
      buildWeb(),
      buildCLI()
    ]);
    
    console.log("\n✅ Build complete!");
    console.log("📦 Output: dist/");
    console.log("   - dist/index.html (web app)");
    console.log("   - dist/script.js (bundled web JS)");
    console.log("   - dist/style.css");
    console.log("   - dist/data/ (word lists)");
    console.log("   - dist/cli/index.js (CLI executable)");
    
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

main();
