#!/usr/bin/env node

/**
 * CLI tool for password generation
 * Usage:
 *   node cli/index.js pwd --len 20 --symbols
 *   node cli/index.js passphrase --words 6 --sep "-"
 *   node cli/index.js icloud --count 5
 *   node cli/index.js userid --mode cvc --syllables 2 --count 10
 */

import {
  generatePassword,
  generateIcloudPassword,
  generateEasyWritePassword,
  generateEasySayPassword,
  generatePassphrase,
  generateCvcId,
  generateWordsId,
  normalizeWord,
  calculateEntropyBits,
  estimateCrackTimeSeconds,
  formatCrackTime,
  CRACK_HARDWARE_PROFILES,
  validateSymbolsInput,
  getCharset,
  SAFE_SYMBOLS
} from "../core/index.js";
import { randomInt } from "./random.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load word lists
let DICEWARE_WORDS = [];
let WORD_ADJECTIVES = [];
let WORD_NOUNS = [];

try {
  DICEWARE_WORDS = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/diceware_words.json"), "utf8"));
  WORD_ADJECTIVES = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/adjs.json"), "utf8")).map(normalizeWord).filter(Boolean);
  WORD_NOUNS = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/nouns.json"), "utf8")).map(normalizeWord).filter(Boolean);
} catch (error) {
  console.error("Error loading word lists:", error.message);
  process.exit(1);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return null;
  }

  const command = args[0];
  const config = { command };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      config[key] = value;
      i++;
    }
  }

  return config;
}

// Output result
function outputResult(result, config) {
  if (config.json) {
    console.log(JSON.stringify({
      value: result.value,
      entropy: result.entropy,
      crackTime: result.crackTime
    }, null, 2));
  } else {
    console.log(`Generated: ${result.value}`);
    console.log(`Entropy: ${result.entropy.toFixed(1)} bits`);
    if (result.crackTime) {
      console.log(`Est. crack time (${result.hardware}): ${result.crackTime}`);
    }
  }
}

// Main
function main() {
  const config = parseArgs();
  if (!config) {
    console.log("Usage:");
    console.log("  node cli/index.js pwd --len 20 --symbols");
    console.log("  node cli/index.js passphrase --words 6 --sep \"-\"");
    console.log("  node cli/index.js icloud --count 5");
    console.log("  node cli/index.js userid --mode cvc --syllables 2 --count 10");
    console.log("\nAdd --json for machine-readable output");
    process.exit(1);
  }

  const count = config.count ? parseInt(config.count, 10) : 1;
  const hardware = config.hw || "rtx4090";
  const guessesPerSecond = CRACK_HARDWARE_PROFILES[hardware] || CRACK_HARDWARE_PROFILES.cpu;

  try {
    for (let i = 0; i < count; i++) {
      let result = null;

      if (config.command === "pwd") {
        const mode = config.mode || "strong";
        
        if (mode === "icloud") {
          const value = generateIcloudPassword(randomInt);
          const entropy = 71; // Fixed for iCloud
          const seconds = estimateCrackTimeSeconds(entropy, guessesPerSecond);
          result = {
            value,
            entropy,
            crackTime: formatCrackTime(seconds),
            hardware
          };
        } else if (mode === "easywrite") {
          const length = parseInt(config.len || "16", 10);
          const value = generateEasyWritePassword(length, randomInt);
          const poolSize = 22 + 22 + 6 + 4; // UNAMBIGUOUS sets
          const entropy = calculateEntropyBits(length, poolSize);
          const seconds = estimateCrackTimeSeconds(entropy, guessesPerSecond);
          result = {
            value,
            entropy,
            crackTime: formatCrackTime(seconds),
            hardware
          };
        } else if (mode === "easysay") {
          const syllables = parseInt(config.sy || "5", 10);
          const addDigit = config.dig === "1";
          const value = generateEasySayPassword(syllables, addDigit, randomInt);
          const syllableEntropy = Math.log2(21) + Math.log2(6) + Math.log2(21);
          let entropy = syllables * syllableEntropy;
          if (addDigit) entropy += Math.log2(6);
          const seconds = estimateCrackTimeSeconds(entropy, guessesPerSecond);
          result = {
            value,
            entropy,
            crackTime: formatCrackTime(seconds),
            hardware
          };
        } else if (mode === "passphrase") {
          const wordCount = parseInt(config.words || config.wc || "6", 10);
          const separator = config.sep === "space" ? " " : (config.sep || " ");
          const capitalize = config.cap === "1";
          const addDigits = config.dig === "1";
          const value = generatePassphrase({
            wordCount,
            separator,
            capitalize,
            addDigits
          }, DICEWARE_WORDS, randomInt);
          if (!value) {
            console.error("Error: Failed to generate passphrase");
            continue;
          }
          const wordListSize = DICEWARE_WORDS.length;
          let entropy = wordCount * Math.log2(wordListSize);
          if (capitalize) entropy += Math.log2(wordCount);
          if (addDigits) entropy += Math.log2(100);
          const seconds = estimateCrackTimeSeconds(entropy, guessesPerSecond);
          result = {
            value,
            entropy,
            crackTime: formatCrackTime(seconds),
            hardware
          };
        } else {
          // Strong mode
          const length = parseInt(config.len || "12", 10);
          const useLower = config.low !== "0";
          const useUpper = config.up !== "0";
          const useDigits = config.dig !== "0";
          const useSymbols = config.sym === "1";
          const symbols = config.symset || (useSymbols ? SAFE_SYMBOLS : "");
          
          const charset = getCharset({
            useLower,
            useUpper,
            useDigits,
            useSymbols,
            symbols
          });
          
          if (!charset.ok) {
            console.error("Error:", charset.msg);
            continue;
          }
          
          const value = generatePassword({ length, pool: charset.pool }, randomInt);
          const entropy = calculateEntropyBits(length, charset.pool.length);
          const seconds = estimateCrackTimeSeconds(entropy, guessesPerSecond);
          result = {
            value,
            entropy,
            crackTime: formatCrackTime(seconds),
            hardware
          };
        }
      } else if (config.command === "userid") {
        const mode = config.mode || "cvc";
        
        if (mode === "cvc") {
          const id = generateCvcId({
            syllables: parseInt(config.sy || "2", 10),
            addDigits: config.dig !== "0",
            digitsCount: parseInt(config.dig || "2", 10),
            addSuffix: config.suf ? true : false,
            suffix: config.suf || "",
            maxLength: parseInt(config.max || "15", 10)
          }, randomInt);
          
          if (!id) {
            console.error("Error: Failed to generate user ID");
            continue;
          }
          
          result = {
            value: id,
            entropy: 0, // User IDs don't have meaningful entropy
            crackTime: null,
            hardware: null
          };
        } else {
          const id = generateWordsId({
            wordsCount: parseInt(config.wc || "2", 10),
            separator: config.sep || "_",
            addDigits: config.dig !== "0",
            digitsCount: parseInt(config.dig || "2", 10),
            maxLength: parseInt(config.max || "20", 10)
          }, WORD_ADJECTIVES, WORD_NOUNS, randomInt);
          
          if (!id) {
            console.error("Error: Failed to generate user ID");
            continue;
          }
          
          result = {
            value: id,
            entropy: 0,
            crackTime: null,
            hardware: null
          };
        }
      } else {
        console.error(`Unknown command: ${config.command}`);
        process.exit(1);
      }
      
      outputResult(result, config);
      if (i < count - 1 && !config.json) {
        console.log();
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
