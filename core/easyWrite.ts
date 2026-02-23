import { UNAMBIGUOUS_LOWERCASE, UNAMBIGUOUS_UPPERCASE, UNAMBIGUOUS_DIGITS, SAFE_SYMBOLS } from "./constants.js";
import { calculateEntropyBits } from "./entropy.js";
import { estimateCrackTimeSeconds, CRACK_HARDWARE_PROFILES } from "./crackTime.js";
import type { PasswordResult, RandomIntFunction } from "./types.js";

export function generateEasyWritePassword(length: number, randomInt: RandomIntFunction): PasswordResult {
  let pool = UNAMBIGUOUS_LOWERCASE + UNAMBIGUOUS_UPPERCASE + UNAMBIGUOUS_DIGITS + SAFE_SYMBOLS;
  
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += pool[randomInt(pool.length)];
  }
  
  const poolSize = pool.length;
  const entropy = calculateEntropyBits(length, poolSize);

  const crackTime: Record<string, number> = {};
  for (const [profile, guessesPerSecond] of Object.entries(CRACK_HARDWARE_PROFILES)) {
    crackTime[profile] = estimateCrackTimeSeconds(entropy, guessesPerSecond);
  }

  return {
    value: pwd,
    entropy,
    crackTime
  };
}
