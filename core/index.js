/**
 * Core password generator library
 * Shared code used by both web app and CLI
 */

// Entropy and crack time
export { calculateEntropyBits } from "./entropy.js";
export { estimateCrackTimeSeconds, formatCrackTime, CRACK_HARDWARE_PROFILES } from "./crackTime.js";

// Validation
export { validateSymbolsInput, getCharset } from "./validate.js";

// Generators
export { generatePassword } from "./password.js";
export { generateIcloudPassword } from "./icloud.js";
export { generateEasyWritePassword } from "./easyWrite.js";
export { generateEasySayPassword } from "./easySayCvc.js";
export { generatePassphrase } from "./diceware.js";
export { generateCvcId, generateWordsId, normalizeWord } from "./userid.js";

// Constants
export * from "./constants.js";
