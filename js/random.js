/**
 * Web-specific random number generator using crypto.getRandomValues
 */

/**
 * Generate random integer in range [0, max)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
export function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}
