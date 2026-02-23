import fs from "node:fs";
import { parseArgs, type ParsedArgs } from "./parseArgs.js";
import { formatText, formatJSON } from "./output.js";
import { randomInt } from "./random.js";
import {
  generatePassword,
  generateIcloudPassword,
  generateEasyWritePassword,
  generateEasySayPassword,
  generateDicewarePassphrase,
  generateCvcId,
  generateWordsId,
  getCharset,
  validateSymbolsInput,
  calculateEntropyBits,
  estimateCrackTimeSeconds,
  CRACK_HARDWARE_PROFILES
} from "../src/core/index.js";
import type { PasswordResult } from "../src/core/types.js";

// Load word lists
const dicewareWords: string[] = JSON.parse(
  fs.readFileSync(new URL("../data/diceware_words.json", import.meta.url), "utf8")
);

const adjectives: string[] = JSON.parse(
  fs.readFileSync(new URL("../data/adjs.json", import.meta.url), "utf8")
);

const nouns: string[] = JSON.parse(
  fs.readFileSync(new URL("../data/nouns.json", import.meta.url), "utf8")
);

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const normalizedAdjectives = adjectives.map(normalizeWord).filter(Boolean);
const normalizedNouns = nouns.map(normalizeWord).filter(Boolean);

function showHelp(): void {
  console.log(`
Usage: securegen <command> [options]

Commands:
  pwd         Generate a password
  passphrase  Generate a Diceware passphrase
  icloud      Generate iCloud-style password
  userid      Generate user IDs

Options:
  --json      Output as JSON
  --hw <profile>  Hardware profile (cpu, rtx4090, rig8x4090, datacenter)

Password (pwd) options:
  --mode <mode>     Mode: strong, easyWrite, easySay (default: strong)
  --len <length>    Password length (default: 16)
  --lowercase       Include lowercase letters
  --uppercase       Include uppercase letters
  --digits          Include digits
  --symbols         Include symbols
  --symbols-custom <chars>  Custom symbol set

Passphrase options:
  --words <count>   Number of words (4-8, default: 6)
  --sep <separator> Separator: space, -, _ (default: space)
  --capitalize      Capitalize one random word
  --digits          Add 2 digits at the end

iCloud options:
  --count <n>       Number of passwords (default: 1)

User ID options:
  --mode <mode>     Mode: cvc, words (default: cvc)
  --syllables <n>   Number of syllables (CVC mode)
  --count <n>       Number of IDs (default: 10)
  --max-length <n>  Maximum length (default: 15)
  --add-digits     Add digits
  --digits-count <n> Number of digits (default: 2)
  --words-count <n> Number of words (2 or 3, words mode)
  --separator <sep> Separator: _, -, none (words mode)
`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const { command, flags, options } = args;
  const jsonOutput = flags.json || false;
  const hardwareProfile = options.hw || "rtx4090";

  if (!command || command === "help" || flags.help) {
    showHelp();
    process.exit(0);
  }

  try {
    let result: PasswordResult | Array<PasswordResult | { value: string }> | null = null;

    if (command === "pwd") {
      const mode = options.mode || "strong";
      const length = parseInt(options.len || "16", 10);

      if (mode === "strong") {
        const charset = getCharset({
          useLower: flags.lowercase !== false,
          useUpper: flags.uppercase !== false,
          useDigits: flags.digits !== false,
          useSymbols: flags.symbols || false,
          symbols: options["symbols-custom"] || "-_!@#"
        });

        if (!charset.ok) {
          console.error("Error:", charset.msg);
          process.exit(1);
        }

        result = generatePassword({ length, charset: charset.pool ?? "" }, randomInt);

      } else if (mode === "easyWrite") {
        result = generateEasyWritePassword(length, randomInt);

      } else if (mode === "easySay") {
        const syllables = parseInt(options.syllables || "5", 10);
        const addDigit = flags.digits || false;
        result = generateEasySayPassword(syllables, addDigit, randomInt);
      }

    } else if (command === "passphrase") {
      const wordCount = parseInt(options.words || "6", 10);
      // Handle separator: support --sep=- or --sep "-" (special case for single dash)
      let sepValue = options.sep;
      if (sepValue === undefined && flags.sep) {
        // --sep was treated as a flag, check if next arg is "-"
        const sepIndex = process.argv.indexOf("--sep");
        if (sepIndex >= 0 && sepIndex + 1 < process.argv.length && process.argv[sepIndex + 1] === "-") {
          sepValue = "-";
        }
      }
      const separator = sepValue === "-" ? "-" : sepValue === "_" ? "_" : " ";
      const capitalize = flags.capitalize || false;
      const addDigits = flags.digits || false;

      result = generateDicewarePassphrase(
        { wordCount, separator, capitalize, addDigits },
        dicewareWords,
        randomInt
      );

    } else if (command === "icloud") {
      const count = parseInt(options.count || "1", 10);
      const results: PasswordResult[] = [];
      for (let i = 0; i < count; i++) {
        results.push(generateIcloudPassword(randomInt));
      }
      result = results;

    } else if (command === "userid") {
      const mode = options.mode || "cvc";
      const count = parseInt(options.count || "10", 10);
      const results: Array<{ value: string }> = [];

      if (mode === "cvc") {
        const syllables = parseInt(options.syllables || "2", 10);
        const maxLength = parseInt(options["max-length"] || "15", 10);
        const addDigits = flags["add-digits"] || false;
        const digitsCount = parseInt(options["digits-count"] || "2", 10);

        for (let i = 0; i < count; i++) {
          let id: string | null = null;
          for (let attempt = 0; attempt < 50; attempt++) {
            id = generateCvcId({
              syllables,
              addDigits,
              digitsCount,
              addSuffix: false,
              suffix: "",
              maxLength
            }, randomInt);
            if (id) break;
          }
          if (id) {
            results.push({ value: id });
          }
        }

      } else if (mode === "words") {
        const wordsCount = parseInt(options["words-count"] || "2", 10);
        const separator = options.separator === "-" ? "-" : options.separator === "none" ? "" : "_";
        const maxLength = parseInt(options["max-length"] || "20", 10);
        const addDigits = flags["add-digits"] || false;
        const digitsCount = parseInt(options["digits-count"] || "2", 10);

        for (let i = 0; i < count; i++) {
          let id: string | null = null;
          for (let attempt = 0; attempt < 50; attempt++) {
            id = generateWordsId({
              wordsCount,
              separator,
              addDigits,
              digitsCount,
              maxLength
            }, normalizedAdjectives, normalizedNouns, randomInt);
            if (id) break;
          }
          if (id) {
            results.push({ value: id });
          }
        }
      }

      result = results;

    } else {
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
    }

    if (result === null) {
      console.error("No result generated");
      process.exit(1);
    }

    if (jsonOutput) {
      console.log(formatJSON(result));
    } else {
      console.log(formatText(result, hardwareProfile));
    }

  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
