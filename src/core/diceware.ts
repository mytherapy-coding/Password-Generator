import { DIGITS } from "./constants.js";
import { estimateCrackTimeSeconds, CRACK_HARDWARE_PROFILES } from "./crackTime.js";
import type { DicewareConfig, PasswordResult, RandomIntFunction } from "./types.js";

/**
 * Generate Diceware passphrase
 */
export function generateDicewarePassphrase(
  config: DicewareConfig,
  wordList: string[],
  randomInt: RandomIntFunction
): PasswordResult {
  if (!wordList || wordList.length === 0) {
    throw new Error("Word list is empty or not provided");
  }

  function pick(pool: string): string {
    return pool[randomInt(pool.length)];
  }

  const words: string[] = [];
  
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
  const crackTime: Record<string, number> = {};
  for (const [profile, guessesPerSecond] of Object.entries(CRACK_HARDWARE_PROFILES)) {
    crackTime[profile] = estimateCrackTimeSeconds(entropy, guessesPerSecond);
  }

  return {
    value: passphrase,
    entropy,
    crackTime
  };
}
