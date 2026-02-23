// core/easySayCvc.js
import { VOWELS, EASY_SAY_CONSONANTS, UNAMBIGUOUS_DIGITS } from "./constants.js";
import { estimateCrackTimeSeconds, CRACK_HARDWARE_PROFILES } from "./crackTime.js";

export function generateEasySayPassword(syllableCount, addDigit, randomInt) {
  function pick(pool) {
    return pool[randomInt(pool.length)];
  }

  // Generate CVC syllables using unambiguous consonants
  let pwd = "";
  
  for (let i = 0; i < syllableCount; i++) {
    pwd += pick(EASY_SAY_CONSONANTS) + pick(VOWELS) + pick(EASY_SAY_CONSONANTS);
  }
  
  // Add exactly one digit at the end if requested
  if (addDigit) {
    pwd += pick(UNAMBIGUOUS_DIGITS);
  }
  
  // Calculate entropy: each syllable is CVC (consonant * vowel * consonant)
  const syllableEntropy = Math.log2(EASY_SAY_CONSONANTS.length) + 
                         Math.log2(VOWELS.length) + 
                         Math.log2(EASY_SAY_CONSONANTS.length);
  let entropy = syllableCount * syllableEntropy;
  if (addDigit) {
    entropy += Math.log2(UNAMBIGUOUS_DIGITS.length);
  }

  const crackTime = {};
  for (const [profile, guessesPerSecond] of Object.entries(CRACK_HARDWARE_PROFILES)) {
    crackTime[profile] = estimateCrackTimeSeconds(entropy, guessesPerSecond);
  }

  return {
    value: pwd,
    entropy,
    crackTime
  };
}
