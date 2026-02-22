/**
 * Generate a random password
 * @param {Object} config - Configuration
 * @param {number} config.length - Password length
 * @param {string} config.pool - Character pool
 * @param {Function} randomInt - Random integer function (max) => number
 * @returns {string} Generated password
 */
export function generatePassword(config, randomInt) {
  let result = "";
  for (let i = 0; i < config.length; i++) {
    const index = randomInt(config.pool.length);
    result += config.pool[index];
  }
  return result;
}
