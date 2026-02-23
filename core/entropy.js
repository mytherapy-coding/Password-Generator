/**
 * Calculate entropy in bits
 * @param {number} length - Length of password
 * @param {number} poolSize - Size of character pool
 * @returns {number} Entropy in bits
 */
export function calculateEntropyBits(length, poolSize) {
  return length * Math.log2(poolSize);
}
