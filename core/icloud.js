import { CONSONANTS, VOWELS, DIGITS } from "./constants.js";

/**
 * Generate iCloud-style password
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string} Generated password
 */
export function generateIcloudPassword(randomInt) {
  function generateSyllable() {
    return CONSONANTS[randomInt(CONSONANTS.length)] + 
           VOWELS[randomInt(VOWELS.length)] + 
           CONSONANTS[randomInt(CONSONANTS.length)];
  }

  function generateChunk6() {
    return generateSyllable() + generateSyllable();
  }

  // Generate 3 chunks of 6 letters each (CVC-CVC pattern)
  let chunks = [generateChunk6(), generateChunk6(), generateChunk6()];
  let pwd = chunks.join("-");

  // Find valid positions for digit insertion (not at first position, near hyphens or at end)
  const positions = [];
  for (let i = 0; i < pwd.length; i++) {
    if (pwd[i] === "-") {
      // Positions adjacent to hyphens (but not before first character)
      if (i - 1 > 0) positions.push(i - 1); // After hyphen, but not first char
      if (i + 1 < pwd.length) positions.push(i + 1); // Before hyphen
    }
  }
  // Last position is valid (but not first)
  if (pwd.length > 1) {
    positions.push(pwd.length - 1);
  }

  // Insert exactly one digit at a random valid position (never at first)
  if (positions.length > 0) {
    const pos = positions[randomInt(positions.length)];
    pwd = pwd.slice(0, pos) + DIGITS[randomInt(DIGITS.length)] + pwd.slice(pos + 1);
  }

  // Uppercase exactly one letter (not the first character)
  const letters = [];
  for (let i = 1; i < pwd.length; i++) { // Start from index 1, skip first
    if (/[a-z]/.test(pwd[i])) letters.push(i);
  }
  if (letters.length > 0) {
    const up = letters[randomInt(letters.length)];
    pwd = pwd.slice(0, up) + pwd[up].toUpperCase() + pwd.slice(up + 1);
  }

  return pwd;
}
