import { DIGITS } from "./constants.js";
import { calculateEntropyBits } from "./entropy.js";
import { estimateCrackTimeSeconds, CRACK_HARDWARE_PROFILES } from "./crackTime.js";

/**
 * Generate Diceware passphrase
 * @param {Object} config - Configuration
 * @param {number} config.wordCount - Number of words
 * @param {string} config.separator - Word separator
 * @param {boolean} config.capitalize - Capitalize one random word
 * @param {boolean} config.addDigits - Add 2 digits at the end
 * @param {Array<string>} wordList - Word list array
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {{value: string, entropy: number, crackTime: Object}} Generated passphrase with metadata
 */
export function generateDicewarePassphrase(config, wordList, randomInt) {
  if (!wordList || wordList.length === 0) {
    throw new Error("Word list is empty or not provided");
  }

  function pick(pool) {
    return pool[randomInt(pool.length)];
  }

  const words = [];
  
  // Pick words uniformly at random
  for (let i = 0; i < config.wordCount; i++) {
    const word = wordList[randomInt(wordList.length)];
    words.push(word);
  }
  
  // Capitalize one random word if requested
  if (config.capitalize && words.length > 0) {
    const capIndex = randomInt(words.length);
    words[capIndex] = words[capIndex].charAt(0).toUpperCase() + words[capIndex].slice(1);
  }
  
  // Join words with separator
  let passphrase = words.join(config.separator);
  
  // Add digits at the end if requested (2 digits)
  if (config.addDigits) {
    const digit1 = pick(DIGITS);
    const digit2 = pick(DIGITS);
    passphrase += digit1 + digit2;
  }

  // Calculate entropy: wordCount × log2(wordListSize)
  // Note: capitalization and digits add minimal entropy, so we use base word entropy
  const baseEntropy = config.wordCount * Math.log2(wordList.length);
  
  // Add entropy for capitalization (if enabled): log2(wordCount) bits
  let entropy = baseEntropy;
  if (config.capitalize) {
    entropy += Math.log2(config.wordCount);
  }
  
  // Add entropy for digits (if enabled): 2 digits = log2(100) ≈ 6.64 bits
  if (config.addDigits) {
    entropy += Math.log2(100);
  }

  // Calculate crack time for all hardware profiles
  const crackTime = {};
  for (const [profile, guessesPerSecond] of Object.entries(CRACK_HARDWARE_PROFILES)) {
    crackTime[profile] = estimateCrackTimeSeconds(entropy, guessesPerSecond);
  }

  return {
    value: passphrase,
    entropy,
    crackTime
  };
}
