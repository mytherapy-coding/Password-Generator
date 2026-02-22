import { DIGITS } from "./constants.js";

/**
 * Generate Diceware passphrase
 * @param {Object} config - Configuration
 * @param {number} config.wordCount - Number of words (4-8)
 * @param {string} config.separator - Word separator (space, -, _)
 * @param {boolean} config.capitalize - Capitalize one random word
 * @param {boolean} config.addDigits - Add 2 digits at end
 * @param {string[]} words - Word list array
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string | null} Generated passphrase or null if word list is empty
 */
export function generatePassphrase(config, words, randomInt) {
  if (!words || words.length === 0) {
    return null;
  }
  
  const selectedWords = [];
  
  // Pick words uniformly at random
  for (let i = 0; i < config.wordCount; i++) {
    const word = words[randomInt(words.length)];
    selectedWords.push(word);
  }
  
  // Capitalize one random word if requested
  if (config.capitalize && selectedWords.length > 0) {
    const capIndex = randomInt(selectedWords.length);
    selectedWords[capIndex] = selectedWords[capIndex].charAt(0).toUpperCase() + selectedWords[capIndex].slice(1);
  }
  
  // Join words with separator
  let passphrase = selectedWords.join(config.separator);
  
  // Add digits at the end if requested (2 digits)
  if (config.addDigits) {
    const digit1 = DIGITS[randomInt(DIGITS.length)];
    const digit2 = DIGITS[randomInt(DIGITS.length)];
    passphrase += digit1 + digit2;
  }
  
  return passphrase;
}
