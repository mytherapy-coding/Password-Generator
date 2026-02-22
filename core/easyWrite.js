import { UNAMBIGUOUS_LOWERCASE, UNAMBIGUOUS_UPPERCASE, UNAMBIGUOUS_DIGITS, SAFE_SYMBOLS } from "./constants.js";

/**
 * Generate easy-to-write password (unambiguous characters only)
 * @param {number} length - Password length
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string} Generated password
 */
export function generateEasyWritePassword(length, randomInt) {
  // Use unambiguous characters only
  let pool = UNAMBIGUOUS_LOWERCASE + UNAMBIGUOUS_UPPERCASE + UNAMBIGUOUS_DIGITS + SAFE_SYMBOLS;
  
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += pool[randomInt(pool.length)];
  }
  
  return pwd;
}
