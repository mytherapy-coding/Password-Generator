/**
 * Node.js-specific random number generator using node:crypto
 */

import { randomInt as nodeRandomInt } from "node:crypto";

/**
 * Generate random integer in range [0, max)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
export function randomInt(max) {
  return nodeRandomInt(max);
}
