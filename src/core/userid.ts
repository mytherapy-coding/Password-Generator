import { CONSONANTS, VOWELS, DIGITS } from "./constants.js";
import type { CvcIdOptions, WordsIdOptions, RandomIntFunction } from "./types.js";

/**
 * Generate CVC-based user ID
 */
export function generateCvcId(opts: CvcIdOptions, randomInt: RandomIntFunction): string | null {
  function pick(pool: string): string {
    return pool[randomInt(pool.length)];
  }

  function generateCvcStem(n: number): string {
    let out = "";
    for (let i = 0; i < n; i++) {
      out += pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS);
    }
    return out;
  }

  let id = generateCvcStem(opts.syllables);

  if (opts.addDigits) {
    for (let i = 0; i < opts.digitsCount; i++) {
      id += pick(DIGITS);
    }
  }

  if (opts.addSuffix && opts.suffix) {
    id += "_" + opts.suffix.toLowerCase();
  }

  if (!/^[a-z]/.test(id)) return null;
  if (id.length > opts.maxLength) return null;

  return id;
}

/**
 * Generate words-based user ID
 */
export function generateWordsId(
  opts: WordsIdOptions,
  adjectives: string[],
  nouns: string[],
  randomInt: RandomIntFunction
): string | null {
  if (!adjectives || adjectives.length === 0 || !nouns || nouns.length === 0) {
    return null;
  }

  function pick(pool: string): string {
    return pool[randomInt(pool.length)];
  }

  const sep = opts.separator === "none" ? "" : opts.separator;

  for (let attempt = 0; attempt < 50; attempt++) {
    const words: string[] = [];

    if (opts.wordsCount === 2) {
      const adj = adjectives[randomInt(adjectives.length)];
      const noun = nouns[randomInt(nouns.length)];
      if (!adj || !noun) continue;
      words.push(adj, noun);
    } else {
      const adj1 = adjectives[randomInt(adjectives.length)];
      const adj2 = adjectives[randomInt(adjectives.length)];
      const noun = nouns[randomInt(nouns.length)];
      if (!adj1 || !adj2 || !noun) continue;
      words.push(adj1, adj2, noun);
    }

    let id = words.join(sep);

    if (opts.addDigits) {
      let d = "";
      for (let i = 0; i < opts.digitsCount; i++) {
        d += pick(DIGITS);
      }
      id += d;  // Always append digits directly, no separator
    }

    id = id.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

    if (!/^[a-z]/.test(id)) continue;
    if (id.length > opts.maxLength) continue;

    return id;
  }

  return null;
}
