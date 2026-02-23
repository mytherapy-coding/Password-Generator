import { calculateEntropyBits } from "./entropy.js";
import { estimateCrackTimeSeconds, CRACK_HARDWARE_PROFILES } from "./crackTime.js";
import type { PasswordConfig, PasswordResult, RandomIntFunction } from "./types.js";

export function generatePassword(config: PasswordConfig, randomInt: RandomIntFunction): PasswordResult {
  let result = "";

  for (let i = 0; i < config.length; i++) {
    const index = randomInt(config.charset.length);
    result += config.charset[index];
  }

  const entropy = calculateEntropyBits(config.length, config.charset.length);
  
  const crackTime: Record<string, number> = {};
  for (const [profile, guessesPerSecond] of Object.entries(CRACK_HARDWARE_PROFILES)) {
    crackTime[profile] = estimateCrackTimeSeconds(entropy, guessesPerSecond);
  }

  return {
    value: result,
    entropy,
    crackTime
  };
}
