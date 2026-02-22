import { EASY_SAY_CONSONANTS, VOWELS, UNAMBIGUOUS_DIGITS } from "./constants.js";

/**
 * Generate easy-to-say password (CVC syllables)
 * @param {number} syllableCount - Number of syllables
 * @param {boolean} addDigit - Add one digit at end
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string} Generated password
 */
export function generateEasySayPassword(syllableCount, addDigit, randomInt) {
  // Generate CVC syllables using unambiguous consonants
  let pwd = "";
  
  for (let i = 0; i < syllableCount; i++) {
    pwd += EASY_SAY_CONSONANTS[randomInt(EASY_SAY_CONSONANTS.length)] + 
           VOWELS[randomInt(VOWELS.length)] + 
           EASY_SAY_CONSONANTS[randomInt(EASY_SAY_CONSONANTS.length)];
  }
  
  // Add exactly one digit at the end if requested
  if (addDigit) {
    pwd += UNAMBIGUOUS_DIGITS[randomInt(UNAMBIGUOUS_DIGITS.length)];
  }
  
  return pwd;
}
