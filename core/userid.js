import { CONSONANTS, VOWELS, DIGITS } from "./constants.js";

/**
 * Normalize word (lowercase, alphanumeric only)
 * @param {string} w - Word to normalize
 * @returns {string} Normalized word
 */
export function normalizeWord(w) {
  return w.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Generate CVC user ID
 * @param {Object} config - Configuration
 * @param {number} config.syllables - Number of syllables (2 or 3)
 * @param {boolean} config.addDigits - Add digits
 * @param {number} config.digitsCount - Number of digits (2 or 3)
 * @param {boolean} config.addSuffix - Add suffix
 * @param {string} config.suffix - Suffix string
 * @param {number} config.maxLength - Maximum length
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string | null} Generated user ID or null if invalid
 */
export function generateCvcId(config, randomInt) {
  function generateCvcStem(n) {
    let out = "";
    for (let i = 0; i < n; i++) {
      out += CONSONANTS[randomInt(CONSONANTS.length)] + 
             VOWELS[randomInt(VOWELS.length)] + 
             CONSONANTS[randomInt(CONSONANTS.length)];
    }
    return out;
  }

  let id = generateCvcStem(config.syllables);

  if (config.addDigits) {
    for (let i = 0; i < config.digitsCount; i++) {
      id += DIGITS[randomInt(DIGITS.length)];
    }
  }

  if (config.addSuffix && config.suffix) {
    id += "_" + config.suffix.toLowerCase();
  }

  if (!/^[a-z]/.test(id)) return null;
  if (id.length > config.maxLength) return null;

  return id;
}

/**
 * Generate words-based user ID
 * @param {Object} config - Configuration
 * @param {number} config.wordsCount - Number of words (2 or 3)
 * @param {string} config.separator - Word separator
 * @param {boolean} config.addDigits - Add digits
 * @param {number} config.digitsCount - Number of digits (2 or 3)
 * @param {number} config.maxLength - Maximum length
 * @param {string[]} adjectives - Adjectives array
 * @param {string[]} nouns - Nouns array
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string | null} Generated user ID or null if invalid
 */
export function generateWordsId(config, adjectives, nouns, randomInt) {
  if (!adjectives || adjectives.length === 0 || !nouns || nouns.length === 0) {
    return null;
  }

  const sep = config.separator === "none" ? "" : config.separator;

  for (let attempt = 0; attempt < 50; attempt++) {
    const words = [];

    if (config.wordsCount === 2) {
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

    if (config.addDigits) {
      let d = "";
      for (let i = 0; i < config.digitsCount; i++) {
        d += DIGITS[randomInt(DIGITS.length)];
      }
      id += sep + d;
    }

    id = id.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

    if (!/^[a-z]/.test(id)) continue;
    if (id.length > config.maxLength) continue;

    return id;
  }

  return null;
}
