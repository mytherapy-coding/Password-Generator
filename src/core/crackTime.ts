/**
 * Hardware profiles for crack-time estimation (guesses per second)
 */
export const CRACK_HARDWARE_PROFILES: Record<string, number> = {
  cpu: 1e9,          // High-end CPU
  rtx4090: 5e11,     // Single RTX 4090
  rig8x4090: 4e12,   // 8x RTX 4090 rig
  datacenter: 1e14   // Datacenter / nation-state
};

/**
 * Round to 1-2 significant digits
 * Examples: 3.456 -> 3.5, 18.7 -> 19, 123.4 -> 120
 */
function roundToSignificantDigits(value: number, digits: number = 2): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, digits - 1 - magnitude);
  return Math.round(value * factor) / factor;
}

/**
 * Format crack time in human-readable units
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatCrackTime(seconds: number): string {
  if (seconds < 1) return "< 1 second";

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const year = 365 * day;

  if (seconds < minute) {
    const rounded = Math.round(seconds);
    return `~${rounded} second${rounded !== 1 ? 's' : ''}`;
  }
  if (seconds < hour) {
    const rounded = Math.round(seconds / minute);
    return `~${rounded} minute${rounded !== 1 ? 's' : ''}`;
  }
  if (seconds < day) {
    const rounded = Math.round(seconds / hour);
    return `~${rounded} hour${rounded !== 1 ? 's' : ''}`;
  }
  if (seconds < week) {
    const rounded = Math.round(seconds / day);
    return `~${rounded} day${rounded !== 1 ? 's' : ''}`;
  }
  if (seconds < year) {
    const rounded = Math.round(seconds / week);
    return `~${rounded} week${rounded !== 1 ? 's' : ''}`;
  }

  const years = seconds / year;
  if (years < 1e6) {
    // For years: use 1 decimal if < 10, otherwise round to integer
    let rounded: string;
    let roundedNum: number;
    if (years < 10) {
      roundedNum = roundToSignificantDigits(years, 2);
      rounded = roundedNum.toFixed(1).replace(/\.0$/, '');
    } else {
      roundedNum = Math.round(years);
      rounded = roundedNum.toString();
    }
    return `~${rounded} year${roundedNum !== 1 ? 's' : ''}`;
  }

  // Millions of years: round to 1-2 significant digits
  const millions = years / 1e6;
  
  // Cap at > 10 million years for very large values
  if (millions > 10) {
    return "> 10 million years";
  }
  
  const rounded = roundToSignificantDigits(millions, 2);
  // Format without scientific notation
  const formatted = rounded >= 10 
    ? Math.round(rounded).toString()
    : rounded.toFixed(1).replace(/\.0$/, '');
  return `~${formatted} million years`;
}

/**
 * Estimate password crack time in seconds (offline attack, worst-case)
 * 
 * Formula:
 *   Keyspace (K) = 2^H, where H = entropy in bits
 *   Expected crack time (T) = 0.5 × K / R
 *   where R = guesses per second (hardware-dependent)
 * 
 * The 0.5 factor accounts for average case (50% of keyspace searched on average)
 * 
 * @param entropyBits - Password entropy in bits (H)
 * @param guessesPerSecond - Attacker's guess rate (R)
 * @returns Estimated crack time in seconds
 */
export function estimateCrackTimeSeconds(entropyBits: number, guessesPerSecond: number): number {
  // Keyspace: K = 2^H
  const keyspace = Math.pow(2, entropyBits);
  
  // Expected guesses (average case): 0.5 × K
  const expectedGuesses = 0.5 * keyspace;
  
  // Crack time: T = expectedGuesses / R
  return expectedGuesses / guessesPerSecond;
}
