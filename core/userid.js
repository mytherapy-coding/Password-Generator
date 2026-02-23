import { CONSONANTS, VOWELS, DIGITS } from "./constants.js";

/**
 * Generate CVC-based user ID
 * @param {Object} opts - Options
 * @param {number} opts.syllables - Number of syllables
 * @param {boolean} opts.addDigits - Add digits
 * @param {number} opts.digitsCount - Number of digits
 * @param {boolean} opts.addSuffix - Add suffix
 * @param {string} opts.suffix - Suffix string
 * @param {number} opts.maxLength - Maximum length
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string|null} Generated ID or null if invalid
 */
export function generateCvcId(opts, randomInt) {
  function pick(pool) {
    return pool[randomInt(pool.length)];
  }

  function generateCvcStem(n) {
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
 * @param {Object} opts - Options
 * @param {number} opts.wordsCount - Number of words (2 or 3)
 * @param {string} opts.separator - Word separator
 * @param {boolean} opts.addDigits - Add digits
 * @param {number} opts.digitsCount - Number of digits
 * @param {number} opts.maxLength - Maximum length
 * @param {Array<string>} adjectives - Adjectives list
 * @param {Array<string>} nouns - Nouns list
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string|null} Generated ID or null if invalid
 */
export function generateWordsId(opts, adjectives, nouns, randomInt) {
  if (!adjectives || adjectives.length === 0 || !nouns || nouns.length === 0) {
    return null;
  }

  function pick(pool) {
    return pool[randomInt(pool.length)];
  }

  const sep = opts.separator === "none" ? "" : opts.separator;

  for (let attempt = 0; attempt < 50; attempt++) {
    const words = [];

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
