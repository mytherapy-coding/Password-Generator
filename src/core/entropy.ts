/**
 * Calculate entropy in bits
 * @param length - Length of password
 * @param poolSize - Size of character pool
 * @returns Entropy in bits
 */
export function calculateEntropyBits(length: number, poolSize: number): number {
  return length * Math.log2(poolSize);
}
