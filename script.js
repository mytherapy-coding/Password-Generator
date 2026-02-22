/* ============================================================
   CLEAN, FULLY WORKING SCRIPT.JS — OPTION C (POLISHED VERSION)
   ============================================================ */

/* ------------------------------
   TAB SWITCHING
------------------------------ */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

/* ------------------------------
   CONSTANTS
------------------------------ */
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const VOWELS = "aeiouy";
const DIGITS = "0123456789";

// Unambiguous characters (removed: O, 0, I, l, 1, S, 5, B, 8)
const UNAMBIGUOUS_LOWERCASE = "abcdefghjkmnpqrtuvwxyz"; // removed: i, l, o, s
const UNAMBIGUOUS_UPPERCASE = "ABCDEFGHJKMNPQRTUVWXYZ"; // removed: I, O, S, B
const UNAMBIGUOUS_DIGITS = "234679"; // removed: 0, 1, 5, 8
const SAFE_SYMBOLS = "-_!@#"; // Default safe symbol set

// Easy to say: unambiguous consonants (removed confusing chars)
const EASY_SAY_CONSONANTS = "bcdfghjkmnpqrstvwxyz"; // removed: l (confusing with I/1)

/* Crack-time hardware profiles (guesses per second) */
const CRACK_HARDWARE_PROFILES = {
  cpu: 1e9,          // High-end CPU
  rtx4090: 5e11,     // Single RTX 4090
  rig8x4090: 4e12,   // 8x RTX 4090 rig
  datacenter: 1e14   // Datacenter / nation-state
};

const LOCAL_STORAGE_CRACK_KEY = "crackHardwareProfile";

/* ------------------------------
   WORD LISTS
------------------------------ */
let WORD_ADJECTIVES = [];
let WORD_NOUNS = [];
let wordsLoaded = false;

/* ------------------------------
   RANDOM HELPERS
------------------------------ */
function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pick(pool) {
  return pool[randomInt(pool.length)];
}

/* ------------------------------
   PASSWORD GENERATOR
------------------------------ */
function validateSymbolsInput(text) {
  if (!text) return { ok: false, msg: "Please enter at least 1 symbol." };
  if (/\s/.test(text)) return { ok: false, msg: "No spaces allowed." };
  if (/[a-zA-Z0-9]/.test(text)) return { ok: false, msg: "Symbols cannot include letters or digits." };

  const unique = [...new Set(text)].join("");
  return unique ? { ok: true, symbols: unique } : { ok: false, msg: "Symbols empty after filtering." };
}

function getCharset(opts) {
  let pool = "";
  if (opts.useLower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (opts.useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.useDigits) pool += "0123456789";
  if (opts.useSymbols) pool += opts.symbols;

  return pool ? { ok: true, pool } : { ok: false, msg: "Select at least one character type." };
}

function generatePassword({ length, pool }) {
  let out = "";
  for (let i = 0; i < length; i++) out += pick(pool);
  return out;
}

/* ------------------------------
   iCLOUD PASSWORD
------------------------------ */
function generateSyllable() {
  return pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS);
}

function generateChunk6() {
  return generateSyllable() + generateSyllable();
}

function generateIcloudPassword() {
  // Generate 3 chunks of 6 letters each (CVC-CVC pattern)
  let chunks = [generateChunk6(), generateChunk6(), generateChunk6()];
  let pwd = chunks.join("-");

  // Find valid positions for digit insertion (not at first position, near hyphens or at end)
  const positions = [];
  for (let i = 0; i < pwd.length; i++) {
    if (pwd[i] === "-") {
      // Positions adjacent to hyphens (but not before first character)
      if (i - 1 > 0) positions.push(i - 1); // After hyphen, but not first char
      if (i + 1 < pwd.length) positions.push(i + 1); // Before hyphen
    }
  }
  // Last position is valid (but not first)
  if (pwd.length > 1) {
    positions.push(pwd.length - 1);
  }

  // Insert exactly one digit at a random valid position (never at first)
  if (positions.length > 0) {
    const pos = pick(positions);
    pwd = pwd.slice(0, pos) + pick(DIGITS) + pwd.slice(pos + 1);
  }

  // Uppercase exactly one letter (not the first character)
  const letters = [];
  for (let i = 1; i < pwd.length; i++) { // Start from index 1, skip first
    if (/[a-z]/.test(pwd[i])) letters.push(i);
  }
  if (letters.length > 0) {
    const up = pick(letters);
    pwd = pwd.slice(0, up) + pwd[up].toUpperCase() + pwd.slice(up + 1);
  }

  return pwd;
}

/* ------------------------------
   EASY TO WRITE PASSWORD
------------------------------ */
function generateEasyWritePassword(length) {
  // Use unambiguous characters only
  let pool = UNAMBIGUOUS_LOWERCASE + UNAMBIGUOUS_UPPERCASE + UNAMBIGUOUS_DIGITS + SAFE_SYMBOLS;
  
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += pick(pool);
  }
  
  return pwd;
}

/* ------------------------------
   EASY TO SAY PASSWORD
------------------------------ */
function generateEasySayPassword(syllableCount, addDigit) {
  // Generate CVC syllables using unambiguous consonants
  let pwd = "";
  
  for (let i = 0; i < syllableCount; i++) {
    pwd += pick(EASY_SAY_CONSONANTS) + pick(VOWELS) + pick(EASY_SAY_CONSONANTS);
  }
  
  // Add exactly one digit at the end if requested
  if (addDigit) {
    pwd += pick(UNAMBIGUOUS_DIGITS);
  }
  
  return pwd;
}

/* ------------------------------
   PASSPHRASE (DICEWARE) GENERATOR
------------------------------ */
function generatePassphrase(wordCount, separator, capitalize, addDigits) {
  // Check if wordlist is available
  if (typeof DICEWARE_WORDS === "undefined" || !DICEWARE_WORDS || DICEWARE_WORDS.length === 0) {
    return null;
  }
  
  const words = [];
  
  // Pick words uniformly at random using crypto.getRandomValues
  for (let i = 0; i < wordCount; i++) {
    const word = DICEWARE_WORDS[randomInt(DICEWARE_WORDS.length)];
    words.push(word);
  }
  
  // Capitalize one random word if requested
  if (capitalize && words.length > 0) {
    const capIndex = randomInt(words.length);
    words[capIndex] = words[capIndex].charAt(0).toUpperCase() + words[capIndex].slice(1);
  }
  
  // Join words with separator
  let passphrase = words.join(separator);
  
  // Add digits at the end if requested (2 digits)
  if (addDigits) {
    const digit1 = pick(DIGITS);
    const digit2 = pick(DIGITS);
    passphrase += digit1 + digit2;
  }
  
  return passphrase;
}

/* ------------------------------
   USER ID — CVC MODE
------------------------------ */
function generateCvcStem(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS);
  return out;
}

function generateCvcId(opts) {
  let id = generateCvcStem(opts.syllables);

  if (opts.addDigits) {
    for (let i = 0; i < opts.digitsCount; i++) id += pick(DIGITS);
  }

  if (opts.addSuffix && opts.suffix) id += "_" + opts.suffix.toLowerCase();

  if (!/^[a-z]/.test(id)) return null;
  if (id.length > opts.maxLength) return null;

  return id;
}

/* ------------------------------
   USER ID — WORDS MODE
------------------------------ */
function normalizeWord(w) {
  return w.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function generateWordsId(opts) {
  if (!wordsLoaded) return null;
  if (WORD_ADJECTIVES.length === 0 || WORD_NOUNS.length === 0) return null;

  const sep = opts.separator === "none" ? "" : opts.separator;

  for (let attempt = 0; attempt < 50; attempt++) {
    const words = [];

    if (opts.wordsCount === 2) {
      const adj = WORD_ADJECTIVES[randomInt(WORD_ADJECTIVES.length)];
      const noun = WORD_NOUNS[randomInt(WORD_NOUNS.length)];
      if (!adj || !noun) continue;
      words.push(adj, noun);
    } else {
      const adj1 = WORD_ADJECTIVES[randomInt(WORD_ADJECTIVES.length)];
      const adj2 = WORD_ADJECTIVES[randomInt(WORD_ADJECTIVES.length)];
      const noun = WORD_NOUNS[randomInt(WORD_NOUNS.length)];
      if (!adj1 || !adj2 || !noun) continue;
      words.push(adj1, adj2, noun);
    }

    let id = words.join(sep);

    if (opts.addDigits) {
      let d = "";
      for (let i = 0; i < opts.digitsCount; i++) d += pick(DIGITS);
      id += sep + d;
    }

    id = id.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

    if (!/^[a-z]/.test(id)) continue;
    if (id.length > opts.maxLength) continue;

    return id;
  }

  return null;
}

/* ------------------------------
   ENTROPY
------------------------------ */
function calculateEntropyBits(length, poolSize) {
  return length * Math.log2(poolSize);
}

/* ------------------------------
   CRACK-TIME ESTIMATION
------------------------------ */
/**
 * Round to 1-2 significant digits
 * Examples: 3.456 -> 3.5, 18.7 -> 19, 123.4 -> 120
 */
function roundToSignificantDigits(value, digits = 2) {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, digits - 1 - magnitude);
  return Math.round(value * factor) / factor;
}

function formatCrackTime(seconds) {
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
    let rounded;
    let roundedNum;
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
 * @param {number} entropyBits - Password entropy in bits (H)
 * @param {number} guessesPerSecond - Attacker's guess rate (R)
 * @returns {number} Estimated crack time in seconds
 */
function estimateCrackTimeSeconds(entropyBits, guessesPerSecond) {
  // Keyspace: K = 2^H
  const keyspace = Math.pow(2, entropyBits);
  
  // Expected guesses (average case): 0.5 × K
  const expectedGuesses = 0.5 * keyspace;
  
  // Crack time: T = expectedGuesses / R
  return expectedGuesses / guessesPerSecond;
}

/* ------------------------------
   CLIPBOARD
------------------------------ */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------
   DOM ELEMENTS
------------------------------ */
const passwordMode = document.getElementById("passwordMode");
const lengthInput = document.getElementById("length");
const lowercaseCheckbox = document.getElementById("lowercase");
const uppercaseCheckbox = document.getElementById("uppercase");
const digitsCheckbox = document.getElementById("digits");
const symbolsCheckbox = document.getElementById("symbols");
const customSymbolsInput = document.getElementById("customSymbols");
const icloudPresetCheckbox = document.getElementById("icloudPreset");

// Mode-specific controls
const strongModeControls = document.getElementById("strongModeControls");
const easyWriteModeControls = document.getElementById("easyWriteModeControls");
const easyWriteLength = document.getElementById("easyWriteLength");
const easySayModeControls = document.getElementById("easySayModeControls");
const easySaySyllables = document.getElementById("easySaySyllables");
const easySayAddDigit = document.getElementById("easySayAddDigit");
const passphraseModeControls = document.getElementById("passphraseModeControls");
const passphraseWordCount = document.getElementById("passphraseWordCount");
const passphraseSeparator = document.getElementById("passphraseSeparator");
const passphraseCapitalize = document.getElementById("passphraseCapitalize");
const passphraseAddDigits = document.getElementById("passphraseAddDigits");

const passwordInput = document.getElementById("password");
const strengthLabelEl = document.getElementById("strengthLabel");
const strengthBarEl = document.getElementById("strengthBar");

const lengthError = document.getElementById("lengthError");
const symbolError = document.getElementById("symbolError");
const copyError = document.getElementById("copyError");
const presetInfo = document.getElementById("presetInfo");

const generateBtn = document.getElementById("generate");
const clearBtn = document.getElementById("clear");
const copyBtn = document.getElementById("copy");
const shareBtn = document.getElementById("share");
const uidShareBtn = document.getElementById("uidShare");

/* Crack-time DOM */
const crackTimeContainer = document.getElementById("crackTimeContainer");
const crackHardwareSelect = document.getElementById("crackHardware");
const crackTimeValue = document.getElementById("crackTimeValue");
const crackTimeWarning = document.getElementById("crackTimeWarning");

const uidMode = document.getElementById("uidMode");
const uidCvcControls = document.getElementById("uidCvcControls");
const uidWordsControls = document.getElementById("uidWordsControls");

const uidSyllables = document.getElementById("uidSyllables");
const uidAddDigits = document.getElementById("uidAddDigits");
const uidDigitsCount = document.getElementById("uidDigitsCount");
const uidAddSuffix = document.getElementById("uidAddSuffix");
const uidSuffix = document.getElementById("uidSuffix");
const uidMaxLength = document.getElementById("uidMaxLength");

const uidWordsCount = document.getElementById("uidWordsCount");
const uidWordsSeparator = document.getElementById("uidWordsSeparator");
const uidWordsAddDigits = document.getElementById("uidWordsAddDigits");
const uidWordsDigitsCount = document.getElementById("uidWordsDigitsCount");
const uidWordsMaxLength = document.getElementById("uidWordsMaxLength");

const uidCount = document.getElementById("uidCount");
const uidGenerateBtn = document.getElementById("uidGenerateBtn");
const uidResults = document.getElementById("uidResults");
const uidError = document.getElementById("uidError");

const resetUserIdSettingsBtn = document.getElementById("resetUserIdSettings");

/* ------------------------------
   UI STATE
------------------------------ */
function updatePasswordModeUI() {
  const mode = passwordMode.value;
  const isIcloud = icloudPresetCheckbox.checked;
  
  // Show/hide mode-specific controls
  strongModeControls.style.display = (mode === "strong" && !isIcloud) ? "" : "none";
  easyWriteModeControls.style.display = (mode === "easyWrite" && !isIcloud) ? "" : "none";
  easySayModeControls.style.display = (mode === "easySay" && !isIcloud) ? "" : "none";
  passphraseModeControls.style.display = (mode === "passphrase" && !isIcloud) ? "" : "none";
  
  // Disable all controls if iCloud preset is active
  if (isIcloud) {
    lengthInput.disabled = true;
    lowercaseCheckbox.disabled = true;
    uppercaseCheckbox.disabled = true;
    digitsCheckbox.disabled = true;
    symbolsCheckbox.disabled = true;
    customSymbolsInput.disabled = true;
    easyWriteLength.disabled = true;
    easySaySyllables.disabled = true;
    easySayAddDigit.disabled = true;
    passphraseWordCount.disabled = true;
    passphraseSeparator.disabled = true;
    passphraseCapitalize.disabled = true;
    passphraseAddDigits.disabled = true;
    passwordMode.disabled = true;
    presetInfo.textContent = "iCloud preset is active.";
  } else {
    lengthInput.disabled = false;
    lowercaseCheckbox.disabled = false;
    uppercaseCheckbox.disabled = false;
    digitsCheckbox.disabled = false;
    symbolsCheckbox.disabled = false;
    customSymbolsInput.disabled = false;
    easyWriteLength.disabled = false;
    easySaySyllables.disabled = false;
    easySayAddDigit.disabled = false;
    passphraseWordCount.disabled = false;
    passphraseSeparator.disabled = false;
    passphraseCapitalize.disabled = false;
    passphraseAddDigits.disabled = false;
    passwordMode.disabled = false;
    presetInfo.textContent = "";
  }
}

// Keep for backward compatibility
function updateIcloudUIState() {
  updatePasswordModeUI();
}

function updateUserIdModeUI() {
  const mode = uidMode.value;
  uidCvcControls.style.display = mode === "cvc" ? "" : "none";
  uidWordsControls.style.display = mode === "words" ? "" : "none";
}

/* Crack-time UI update */
function updateCrackTimeUI(entropyBits) {
  if (!Number.isFinite(entropyBits) || entropyBits <= 0) {
    crackTimeContainer.style.display = "none";
    return;
  }

  const profileKey = crackHardwareSelect.value || "cpu";
  const guessesPerSecond = CRACK_HARDWARE_PROFILES[profileKey] || CRACK_HARDWARE_PROFILES.cpu;

  // Calculate expected crack time: T = 0.5 * K / R
  const seconds = estimateCrackTimeSeconds(entropyBits, guessesPerSecond);
  const formatted = formatCrackTime(seconds);

  crackTimeContainer.style.display = "";
  crackTimeValue.textContent = formatted === "< 1 second" ? formatted : `≈ ${formatted}`;

  // Show warning if entropy < 20 bits
  if (entropyBits < 20) {
    crackTimeWarning.textContent = "This password is extremely weak and can be cracked almost instantly.";
    crackTimeWarning.style.display = "";
  } else {
    crackTimeWarning.style.display = "none";
    crackTimeWarning.textContent = "";
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, profileKey);
  } catch {
    // ignore
  }
}

/**
 * Update crack time based on current settings (live update)
 * Only updates if a password is already generated
 */
function updateCrackTimeFromSettings() {
  // Only update if there's already a password
  if (!passwordInput.value) {
    crackTimeContainer.style.display = "none";
    return;
  }

  // iCloud preset: fixed entropy
  if (icloudPresetCheckbox.checked) {
    updateCrackTimeUI(71);
    return;
  }

  const mode = passwordMode.value;
  let entropyBits = 0;

  if (mode === "easyWrite") {
    const length = Number(easyWriteLength.value);
    if (length < 8 || length > 64) {
      crackTimeContainer.style.display = "none";
      return;
    }
    const poolSize = UNAMBIGUOUS_LOWERCASE.length + UNAMBIGUOUS_UPPERCASE.length + 
                     UNAMBIGUOUS_DIGITS.length + SAFE_SYMBOLS.length;
    entropyBits = calculateEntropyBits(length, poolSize);
    
  } else if (mode === "easySay") {
    const syllableCount = Number(easySaySyllables.value);
    const addDigit = easySayAddDigit.checked;
    const syllableEntropy = Math.log2(EASY_SAY_CONSONANTS.length) + 
                           Math.log2(VOWELS.length) + 
                           Math.log2(EASY_SAY_CONSONANTS.length);
    entropyBits = syllableCount * syllableEntropy;
    if (addDigit) {
      entropyBits += Math.log2(UNAMBIGUOUS_DIGITS.length);
    }
    
  } else if (mode === "passphrase") {
    const wordCount = Number(passphraseWordCount.value);
    if (wordCount < 4 || wordCount > 8) {
      crackTimeContainer.style.display = "none";
      return;
    }
    
    // Check if wordlist is available
    if (typeof DICEWARE_WORDS === "undefined" || !DICEWARE_WORDS || DICEWARE_WORDS.length === 0) {
      crackTimeContainer.style.display = "none";
      return;
    }
    
    const capitalize = passphraseCapitalize.checked;
    const addDigits = passphraseAddDigits.checked;
    
    // Calculate entropy: wordCount × log2(wordListSize)
    const wordListSize = DICEWARE_WORDS.length;
    entropyBits = wordCount * Math.log2(wordListSize);
    
    // Add entropy for capitalization (if enabled)
    if (capitalize) {
      entropyBits += Math.log2(wordCount);
    }
    
    // Add entropy for digits (2 digits = 100 possibilities)
    if (addDigits) {
      entropyBits += Math.log2(100);
    }
    
  } else {
    // Strong mode
    const length = Number(lengthInput.value);
    if (length < 4 || length > 64) {
      crackTimeContainer.style.display = "none";
      return;
    }

    let symbols = "";
    if (symbolsCheckbox.checked) {
      if (!customSymbolsInput.value.trim()) {
        symbols = SAFE_SYMBOLS;
      } else {
        const val = validateSymbolsInput(customSymbolsInput.value);
        if (!val.ok) {
          crackTimeContainer.style.display = "none";
          return;
        }
        symbols = val.symbols;
      }
    }

    const charset = getCharset({
      useLower: lowercaseCheckbox.checked,
      useUpper: uppercaseCheckbox.checked,
      useDigits: digitsCheckbox.checked,
      useSymbols: symbolsCheckbox.checked,
      symbols
    });

    if (!charset.ok) {
      crackTimeContainer.style.display = "none";
      return;
    }

    entropyBits = calculateEntropyBits(length, charset.pool.length);
  }

  updateCrackTimeUI(entropyBits);
}

/* ------------------------------
   PASSWORD PERSISTENCE
------------------------------ */
function savePasswordSettings() {
  const settings = {
    passwordMode: passwordMode.value,
    length: lengthInput.value,
    lowercase: lowercaseCheckbox.checked,
    uppercase: uppercaseCheckbox.checked,
    digits: digitsCheckbox.checked,
    symbols: symbolsCheckbox.checked,
    customSymbols: customSymbolsInput.value,
    icloudPreset: icloudPresetCheckbox.checked,
    easyWriteLength: easyWriteLength.value,
    easySaySyllables: easySaySyllables.value,
    easySayAddDigit: easySayAddDigit.checked,
    passphraseWordCount: passphraseWordCount.value,
    passphraseSeparator: passphraseSeparator.value,
    passphraseCapitalize: passphraseCapitalize.checked,
    passphraseAddDigits: passphraseAddDigits.checked
  };
  localStorage.setItem("passwordSettings", JSON.stringify(settings));
}

function restorePasswordSettings() {
  const raw = localStorage.getItem("passwordSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    passwordMode.value = s.passwordMode ?? "strong";
    lengthInput.value = s.length ?? "12";
    lowercaseCheckbox.checked = s.lowercase ?? true;
    uppercaseCheckbox.checked = s.uppercase ?? true;
    digitsCheckbox.checked = s.digits ?? true;
    symbolsCheckbox.checked = s.symbols ?? false;
    customSymbolsInput.value = s.customSymbols ?? "";
    icloudPresetCheckbox.checked = s.icloudPreset ?? false;
    easyWriteLength.value = s.easyWriteLength ?? "16";
    easySaySyllables.value = s.easySaySyllables ?? "5";
    easySayAddDigit.checked = s.easySayAddDigit ?? true;
    passphraseWordCount.value = s.passphraseWordCount ?? "6";
    passphraseSeparator.value = s.passphraseSeparator ?? " ";
    passphraseCapitalize.checked = s.passphraseCapitalize ?? false;
    passphraseAddDigits.checked = s.passphraseAddDigits ?? false;
    // Don't call updatePasswordModeUI here - it will be called after all settings are restored
  } catch (_) {}
}

/* ------------------------------
   USER ID PERSISTENCE
------------------------------ */
function saveUserIdSettings() {
  const settings = {
    mode: uidMode.value,
    syllables: uidSyllables.value,
    addDigits: uidAddDigits.checked,
    digitsCount: uidDigitsCount.value,
    addSuffix: uidAddSuffix.checked,
    suffix: uidSuffix.value,
    maxLength: uidMaxLength.value,
    wordsCount: uidWordsCount.value,
    separator: uidWordsSeparator.value,
    wordsAddDigits: uidWordsAddDigits.checked,
    wordsDigitsCount: uidWordsDigitsCount.value,
    wordsMaxLength: uidWordsMaxLength.value,
    count: uidCount.value
  };
  localStorage.setItem("userIdSettings", JSON.stringify(settings));
}

function restoreUserIdSettings() {
  const raw = localStorage.getItem("userIdSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    uidMode.value = s.mode ?? "cvc";
    uidSyllables.value = s.syllables ?? "2";
    uidAddDigits.checked = s.addDigits ?? true;
    uidDigitsCount.value = s.digitsCount ?? "2";
    uidAddSuffix.checked = s.addSuffix ?? true;
    uidSuffix.value = s.suffix ?? "dev";
    uidMaxLength.value = s.maxLength ?? "15";
    uidWordsCount.value = s.wordsCount ?? "2";
    uidWordsSeparator.value = s.separator ?? "_";
    uidWordsAddDigits.checked = s.wordsAddDigits ?? false;
    uidWordsDigitsCount.value = s.wordsDigitsCount ?? "2";
    uidWordsMaxLength.value = s.wordsMaxLength ?? "20";
    uidCount.value = s.count ?? "10";
    updateUserIdModeUI();
  } catch (_) {}
}

/* ------------------------------
   WORD LIST LOADING
------------------------------ */
function loadWordLists() {
  // Check if word data is already loaded from script tags
  if (typeof WORD_ADJECTIVES_DATA !== "undefined" && typeof WORD_NOUNS_DATA !== "undefined") {
    WORD_ADJECTIVES = WORD_ADJECTIVES_DATA.map(normalizeWord).filter(Boolean);
    WORD_NOUNS = WORD_NOUNS_DATA.map(normalizeWord).filter(Boolean);

    if (WORD_ADJECTIVES.length === 0 || WORD_NOUNS.length === 0) {
      wordsLoaded = false;
      if (uidError) {
        uidError.textContent = "Word lists are empty after processing";
      }
      console.error("Word lists are empty after processing");
      return;
    }

    wordsLoaded = true;
    console.log(`Loaded ${WORD_ADJECTIVES.length} adjectives and ${WORD_NOUNS.length} nouns`);
    
    // Clear any previous error messages
    if (uidError && uidError.textContent) {
      uidError.textContent = "";
    }
  } else {
    wordsLoaded = false;
    if (uidError) {
      uidError.textContent = "Word lists not loaded. Make sure data/adjs.js and data/nouns.js are included in the page.";
    }
    console.error("Word list data not found. Make sure data/adjs.js and data/nouns.js are loaded.");
  }
}

/* ------------------------------
   PASSWORD HANDLER
------------------------------ */
function handleGeneratePassword() {
  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  crackTimeContainer.style.display = "none";

  // iCloud preset takes precedence
  if (icloudPresetCheckbox.checked) {
    const pwd = generateIcloudPassword();
    passwordInput.value = pwd;
    strengthLabelEl.textContent = "";
    strengthBarEl.style.background = "green";

    // iCloud preset: fixed entropy estimate (~71 bits)
    const entropyBits = 71;
    updateCrackTimeUI(entropyBits);
    return;
  }

  const mode = passwordMode.value;
  let pwd = "";
  let entropyBits = 0;

  if (mode === "easyWrite") {
    // Easy to write mode
    const length = Number(easyWriteLength.value);
    if (length < 8 || length > 64) {
      lengthError.textContent = "Length must be 8–64 for Easy to write mode.";
      crackTimeContainer.style.display = "none";
      return;
    }
    
    pwd = generateEasyWritePassword(length);
    
    // Calculate entropy: pool size = unambiguous lowercase + uppercase + digits + symbols
    const poolSize = UNAMBIGUOUS_LOWERCASE.length + UNAMBIGUOUS_UPPERCASE.length + 
                     UNAMBIGUOUS_DIGITS.length + SAFE_SYMBOLS.length;
    entropyBits = calculateEntropyBits(length, poolSize);
    
  } else if (mode === "easySay") {
    // Easy to say mode
    const syllableCount = Number(easySaySyllables.value);
    const addDigit = easySayAddDigit.checked;
    
    pwd = generateEasySayPassword(syllableCount, addDigit);
    const length = pwd.length;
    
    // Calculate entropy: each syllable is CVC (consonant * vowel * consonant)
    // If digit added, multiply by digit pool size
    const syllableEntropy = Math.log2(EASY_SAY_CONSONANTS.length) + 
                           Math.log2(VOWELS.length) + 
                           Math.log2(EASY_SAY_CONSONANTS.length);
    entropyBits = syllableCount * syllableEntropy;
    if (addDigit) {
      entropyBits += Math.log2(UNAMBIGUOUS_DIGITS.length);
    }
    
  } else if (mode === "passphrase") {
    // Passphrase (Diceware) mode
    const wordCount = Number(passphraseWordCount.value);
    const separator = passphraseSeparator.value;
    const capitalize = passphraseCapitalize.checked;
    const addDigits = passphraseAddDigits.checked;
    
    // Check if wordlist is available
    if (typeof DICEWARE_WORDS === "undefined" || !DICEWARE_WORDS || DICEWARE_WORDS.length === 0) {
      lengthError.textContent = "Diceware word list not loaded. Please ensure data/diceware_words.js is included.";
      crackTimeContainer.style.display = "none";
      return;
    }
    
    pwd = generatePassphrase(wordCount, separator, capitalize, addDigits);
    if (!pwd) {
      lengthError.textContent = "Failed to generate passphrase.";
      crackTimeContainer.style.display = "none";
      return;
    }
    
    // Calculate entropy: wordCount × log2(wordListSize)
    // Capitalization and digits add minimal entropy, but we include them for accuracy
    const wordListSize = DICEWARE_WORDS.length;
    entropyBits = wordCount * Math.log2(wordListSize);
    
    // Add entropy for capitalization (if enabled, one word is capitalized)
    if (capitalize) {
      entropyBits += Math.log2(wordCount); // Which word to capitalize
    }
    
    // Add entropy for digits (2 digits = 100 possibilities)
    if (addDigits) {
      entropyBits += Math.log2(100); // 2 digits = 10^2 = 100
    }
    
  } else {
    // Strong mode (custom sets)
    const length = Number(lengthInput.value);
    if (length < 4 || length > 64) {
      lengthError.textContent = "Length must be 4–64.";
      crackTimeContainer.style.display = "none";
      return;
    }

    let symbols = "";
    if (symbolsCheckbox.checked) {
      // Default to safe symbols if custom symbols is empty
      if (!customSymbolsInput.value.trim()) {
        symbols = SAFE_SYMBOLS;
      } else {
        const val = validateSymbolsInput(customSymbolsInput.value);
        if (!val.ok) {
          symbolError.textContent = val.msg;
          crackTimeContainer.style.display = "none";
          return;
        }
        symbols = val.symbols;
      }
    }

    const charset = getCharset({
      useLower: lowercaseCheckbox.checked,
      useUpper: uppercaseCheckbox.checked,
      useDigits: digitsCheckbox.checked,
      useSymbols: symbolsCheckbox.checked,
      symbols
    });

    if (!charset.ok) {
      symbolError.textContent = charset.msg;
      crackTimeContainer.style.display = "none";
      return;
    }

    pwd = generatePassword({ length, pool: charset.pool });
    entropyBits = calculateEntropyBits(length, charset.pool.length);
  }

  passwordInput.value = pwd;
  strengthLabelEl.textContent = entropyBits < 45 ? "Weak" : entropyBits < 70 ? "Medium" : "Strong";
  strengthBarEl.style.background = entropyBits < 45 ? "red" : entropyBits < 70 ? "orange" : "green";

  updateCrackTimeUI(entropyBits);
}

/* ------------------------------
   USER ID HANDLER
------------------------------ */
function handleGenerateUserIds() {
  uidError.textContent = "";
  uidResults.innerHTML = "";

  const mode = uidMode.value;
  
  if (mode === "words") {
    if (!wordsLoaded) {
      uidError.textContent = "Word lists not loaded. Please refresh the page.";
      return;
    }
    if (WORD_ADJECTIVES.length === 0 || WORD_NOUNS.length === 0) {
      uidError.textContent = "Word lists are empty. Please check data/adjs.js and data/nouns.js files.";
      return;
    }
  }

  const count = Number(uidCount.value);
  const results = [];

  for (let i = 0; i < count; i++) {
    let id = null;

    if (mode === "cvc") {
      id = generateCvcId({
        syllables: Number(uidSyllables.value),
        addDigits: uidAddDigits.checked,
        digitsCount: Number(uidDigitsCount.value),
        addSuffix: uidAddSuffix.checked,
        suffix: uidSuffix.value,
        maxLength: Number(uidMaxLength.value)
      });
    } else {
      id = generateWordsId({
        wordsCount: Number(uidWordsCount.value),
        separator: uidWordsSeparator.value,
        addDigits: uidWordsAddDigits.checked,
        digitsCount: Number(uidWordsDigitsCount.value),
        maxLength: Number(uidWordsMaxLength.value)
      });
    }

    if (!id) {
      uidError.textContent = mode === "words" 
        ? "Could not generate valid IDs. Check max length or word list files."
        : "Could not generate valid IDs. Increase max length.";
      return;
    }

    results.push(id);
  }

  results.forEach((id) => {
    const row = document.createElement("div");
    row.className = "uid-row";

    const span = document.createElement("span");
    span.textContent = id;

    const btn = document.createElement("button");
    btn.textContent = "Copy";
    btn.addEventListener("click", () => copyToClipboard(id));

    row.appendChild(span);
    row.appendChild(btn);
    uidResults.appendChild(row);
  });
}

/* ------------------------------
   RESET USER ID SETTINGS
------------------------------ */
resetUserIdSettingsBtn.addEventListener("click", () => {
  localStorage.removeItem("userIdSettings");

  uidMode.value = "cvc";
  uidSyllables.value = 2;
  uidAddDigits.checked = true;
  uidDigitsCount.value = 2;
  uidAddSuffix.checked = true;
  uidSuffix.value = "dev";
  uidMaxLength.value = 15;

  uidWordsCount.value = 2;
  uidWordsSeparator.value = "_";
  uidWordsAddDigits.checked = false;
  uidWordsDigitsCount.value = 2;
  uidWordsMaxLength.value = 20;

  uidCount.value = 10;

  updateUserIdModeUI();
  uidResults.innerHTML = "";
  uidError.textContent = "";
});

/* ------------------------------
   URL PARAMETER HANDLING (SHARE LINK)
------------------------------ */
/**
 * Build share URL for password generator with short parameter keys
 * Uses URLSearchParams for safe encoding of special characters
 */
function buildPasswordShareUrl() {
  const url = new URL(window.location.href);
  url.search = ""; // Clear old params
  const p = url.searchParams;
  
  p.set("gen", "pwd");
  
  // Determine mode
  let mode = passwordMode.value;
  if (icloudPresetCheckbox.checked) {
    mode = "icloud";
  } else if (mode === "easyWrite") {
    mode = "easywrite";
  } else if (mode === "easySay") {
    mode = "easysay";
  } else if (mode === "passphrase") {
    mode = "passphrase";
  }
  p.set("mode", mode);
  
  // Length (mode-specific)
  if (mode === "easywrite") {
    p.set("len", String(easyWriteLength.value));
  } else if (mode === "easysay") {
    // Syllable count determines length, but we store syllables
    p.set("sy", String(easySaySyllables.value));
    p.set("dig", easySayAddDigit.checked ? "1" : "0");
  } else if (mode === "passphrase") {
    p.set("wc", String(passphraseWordCount.value));
    const sep = passphraseSeparator.value;
    if (sep === " ") {
      p.set("sep", "space");
    } else {
      p.set("sep", sep);
    }
    p.set("cap", passphraseCapitalize.checked ? "1" : "0");
    p.set("dig", passphraseAddDigits.checked ? "1" : "0");
  } else if (mode !== "icloud") {
    // Strong mode
    p.set("len", String(lengthInput.value));
    p.set("low", lowercaseCheckbox.checked ? "1" : "0");
    p.set("up", uppercaseCheckbox.checked ? "1" : "0");
    p.set("dig", digitsCheckbox.checked ? "1" : "0");
    p.set("sym", symbolsCheckbox.checked ? "1" : "0");
    
    // Custom symbols set (URLSearchParams encodes safely)
    if (symbolsCheckbox.checked && customSymbolsInput.value) {
      const symset = customSymbolsInput.value.trim();
      if (symset.length > 0 && symset.length <= 50) { // Limit length
        p.set("symset", symset);
      }
    }
  }
  
  // Hardware profile (map to short keys)
  const hwMap = {
    "cpu": "cpu",
    "rtx4090": "4090",
    "rig8x4090": "rig8",
    "datacenter": "dc"
  };
  const hw = crackHardwareSelect.value;
  if (hwMap[hw]) {
    p.set("hw", hwMap[hw]);
  }
  
  p.set("auto", "1"); // Optional auto-generate
  
  // SECURITY: passwordInput.value is NEVER included in URL parameters
  
  return url.toString();
}

/**
 * Build share URL for User ID generator with short parameter keys
 * Uses URLSearchParams for safe encoding of special characters
 */
function buildUserIdShareUrl() {
  const url = new URL(window.location.href);
  url.search = ""; // Clear old params
  const p = url.searchParams;
  
  p.set("gen", "uid");
  p.set("mode", uidMode.value); // "cvc" or "words"
  p.set("cnt", String(uidCount.value));
  
  if (uidMode.value === "cvc") {
    p.set("sy", String(uidSyllables.value)); // syllables: 2 or 3
    p.set("max", String(uidMaxLength.value));
    p.set("dig", uidAddDigits.checked ? String(uidDigitsCount.value) : "0");
    if (uidAddSuffix.checked && uidSuffix.value) {
      // URLSearchParams encodes safely
      p.set("suf", uidSuffix.value);
    }
  } else {
    // words mode
    p.set("wc", String(uidWordsCount.value)); // words count: 2 or 3
    p.set("sep", uidWordsSeparator.value); // "_", ".", "-", "none"
    p.set("max", String(uidWordsMaxLength.value));
    p.set("dig", uidWordsAddDigits.checked ? String(uidWordsDigitsCount.value) : "0");
  }
  
  p.set("auto", "1"); // Optional auto-generate
  
  // SECURITY: uidResults (generated UserID list) is NEVER included in URL parameters
  
  return url.toString();
}

/**
 * Helper: Get boolean from URL param (1/0)
 */
function getBool(p, key, defaultVal = false) {
  const v = p.get(key);
  if (v === "1") return true;
  if (v === "0") return false;
  return defaultVal;
}

/**
 * Helper: Get integer from URL param with validation
 */
function getInt(p, key, min, max, defaultVal) {
  const n = Number(p.get(key));
  if (!Number.isFinite(n)) return defaultVal;
  if (n < min || n > max) return defaultVal;
  return Math.floor(n);
}

/**
 * Parse URL parameters and restore settings (with validation)
 * Uses short parameter keys: gen, mode, len, low, up, dig, sym, symset, hw, auto
 */
function restoreSettingsFromURL() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.toString() === "") return false; // No URL parameters
  
  const gen = params.get("gen");
  if (!gen || (gen !== "pwd" && gen !== "uid")) return false;
  
  if (gen === "pwd") {
    // Restore password settings using short parameter keys
    const mode = params.get("mode");
    if (mode) {
      if (mode === "icloud") {
        icloudPresetCheckbox.checked = true;
      } else if (mode === "easywrite") {
        passwordMode.value = "easyWrite";
      } else if (mode === "easysay") {
        passwordMode.value = "easySay";
      } else if (mode === "passphrase") {
        passwordMode.value = "passphrase";
      } else if (mode === "strong") {
        passwordMode.value = "strong";
      }
    }
    
    // Mode-specific settings
    if (mode === "easywrite") {
      const len = getInt(params, "len", 8, 64, 16);
      easyWriteLength.value = len;
    } else if (mode === "easysay") {
      const sy = getInt(params, "sy", 4, 6, 5);
      easySaySyllables.value = String(sy);
      easySayAddDigit.checked = getBool(params, "dig", true);
    } else if (mode === "passphrase") {
      const wc = getInt(params, "wc", 4, 8, 6);
      passphraseWordCount.value = String(wc);
      const sep = params.get("sep");
      if (sep === "space") {
        passphraseSeparator.value = " ";
      } else if (sep && ["-", "_"].includes(sep)) {
        passphraseSeparator.value = sep;
      }
      passphraseCapitalize.checked = getBool(params, "cap", false);
      passphraseAddDigits.checked = getBool(params, "dig", false);
    } else if (mode !== "icloud") {
      // Strong mode
      const len = getInt(params, "len", 4, 64, 16);
      lengthInput.value = len;
      lowercaseCheckbox.checked = getBool(params, "low", true);
      uppercaseCheckbox.checked = getBool(params, "up", true);
      digitsCheckbox.checked = getBool(params, "dig", true);
      symbolsCheckbox.checked = getBool(params, "sym", false);
      
      // Custom symbols set (validate length)
      const symset = params.get("symset");
      if (symset != null && symset.length > 0 && symset.length <= 50) {
        customSymbolsInput.value = symset; // Already decoded by URLSearchParams
      }
    }
    
    // Hardware profile (map from short keys)
    const hwMap = {
      "cpu": "cpu",
      "4090": "rtx4090",
      "rig8": "rig8x4090",
      "dc": "datacenter"
    };
    const hw = params.get("hw");
    if (hw && hwMap[hw]) {
      crackHardwareSelect.value = hwMap[hw];
    }
    
    updatePasswordModeUI();
    
    // Switch to password tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="passwordTab"]').classList.add("active");
    document.getElementById("passwordTab").classList.add("active");
    
    // Auto-generate if requested
    if (params.get("auto") === "1") {
      setTimeout(() => {
        handleGeneratePassword();
      }, 100);
    }
    
    return true;
  } else if (gen === "uid") {
    // Restore User ID settings using short parameter keys
    const mode = params.get("mode");
    if (mode && (mode === "cvc" || mode === "words")) {
      uidMode.value = mode;
    }
    
    // Update UI mode first to show/hide correct controls
    updateUserIdModeUI();
    
    // Common settings
    const cnt = getInt(params, "cnt", 5, 50, 10);
    uidCount.value = String(cnt);
    
    if (uidMode.value === "cvc") {
      const sy = getInt(params, "sy", 2, 3, 2);
      uidSyllables.value = String(sy);
      const max = getInt(params, "max", 6, 24, 15);
      uidMaxLength.value = max;
      const dig = getInt(params, "dig", 0, 3, 0);
      if (dig > 0) {
        uidAddDigits.checked = true;
        uidDigitsCount.value = String(dig);
      } else {
        uidAddDigits.checked = false;
      }
      const suf = params.get("suf");
      if (suf != null && suf.length > 0) {
        uidAddSuffix.checked = true;
        uidSuffix.value = suf; // Already decoded by URLSearchParams
      } else {
        uidAddSuffix.checked = false;
      }
    } else {
      // words mode
      const wc = getInt(params, "wc", 2, 3, 2);
      uidWordsCount.value = String(wc);
      const sep = params.get("sep");
      if (sep && ["_", ".", "-", "none"].includes(sep)) {
        uidWordsSeparator.value = sep;
      }
      const max = getInt(params, "max", 8, 30, 20);
      uidWordsMaxLength.value = max;
      const dig = getInt(params, "dig", 0, 3, 0);
      if (dig > 0) {
        uidWordsAddDigits.checked = true;
        uidWordsDigitsCount.value = String(dig);
      } else {
        uidWordsAddDigits.checked = false;
      }
    }
    
    // Switch to User ID tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="userIdTab"]').classList.add("active");
    document.getElementById("userIdTab").classList.add("active");
    
    // Auto-generate if requested
    if (params.get("auto") === "1") {
      setTimeout(() => {
        handleGenerateUserIds();
      }, 100);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Show toast notification
 */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.textContent = message;
  toast.style.display = "block";
  
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

/**
 * Clean URL parameters (nice UX)
 */
function clearUrlParams() {
  const url = new URL(window.location.href);
  url.search = "";
  history.replaceState({}, "", url.toString());
}

/**
 * Copy share link to clipboard
 * Uses URL API for safe encoding of special characters
 */
async function copyShareUrl(genType) {
  let urlString;
  
  if (genType === "pwd") {
    urlString = buildPasswordShareUrl();
  } else if (genType === "uid") {
    urlString = buildUserIdShareUrl();
  } else {
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(urlString);
    showToast("Share link copied!");
    return true;
  } catch {
    // Fallback: select and copy
    const textarea = document.createElement("textarea");
    textarea.value = urlString;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Share link copied!");
      return true;
    } catch {
      document.body.removeChild(textarea);
      showToast("Failed to copy link");
      return false;
    }
  }
}

/* ------------------------------
   EVENT LISTENERS
------------------------------ */
generateBtn.addEventListener("click", handleGeneratePassword);
clearBtn.addEventListener("click", () => {
  passwordInput.value = "";
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "gray";
  copyError.textContent = "";
  crackTimeContainer.style.display = "none";
});
copyBtn.addEventListener("click", async () => {
  if (!(await copyToClipboard(passwordInput.value))) {
    copyError.textContent = "Copy failed.";
  }
});

[
  lengthInput, lowercaseCheckbox, uppercaseCheckbox, digitsCheckbox,
  symbolsCheckbox
].forEach((el) => {
  el.addEventListener("change", () => {
    savePasswordSettings();
    updateCrackTimeFromSettings();
  });
});
customSymbolsInput.addEventListener("input", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

passwordMode.addEventListener("change", () => {
  updatePasswordModeUI();
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

icloudPresetCheckbox.addEventListener("change", () => {
  updatePasswordModeUI();
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

// Easy mode controls
easyWriteLength.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

easySaySyllables.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

easySayAddDigit.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

// Passphrase controls
passphraseWordCount.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

passphraseSeparator.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

passphraseCapitalize.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

passphraseAddDigits.addEventListener("change", () => {
  savePasswordSettings();
  updateCrackTimeFromSettings();
});

uidMode.addEventListener("change", () => {
  updateUserIdModeUI();
  saveUserIdSettings();
});
uidGenerateBtn.addEventListener("click", handleGenerateUserIds);

// Share button event listeners
shareBtn.addEventListener("click", async () => {
  await copyShareUrl("pwd");
});

uidShareBtn.addEventListener("click", async () => {
  await copyShareUrl("uid");
});

[
  uidSyllables, uidAddDigits, uidDigitsCount, uidAddSuffix, uidSuffix, uidMaxLength,
  uidWordsCount, uidWordsSeparator, uidWordsAddDigits, uidWordsDigitsCount, uidWordsMaxLength,
  uidCount
].forEach((el) => {
  el.addEventListener("change", saveUserIdSettings);
});

crackHardwareSelect.addEventListener("change", () => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, crackHardwareSelect.value);
  } catch {
    // ignore
  }
  updateCrackTimeFromSettings();
});

/* ------------------------------
   INIT
------------------------------ */
function restoreCrackHardwareSelection() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CRACK_KEY);
    if (saved && CRACK_HARDWARE_PROFILES[saved]) {
      crackHardwareSelect.value = saved;
    }
  } catch {
    // ignore
  }
}

// Check for URL parameters first (share link)
const urlParamsRestored = restoreSettingsFromURL();

// If no URL parameters, restore from localStorage
if (!urlParamsRestored) {
  restorePasswordSettings();
  restoreUserIdSettings();
  restoreCrackHardwareSelection();
  // Update UI after all settings are restored
  updatePasswordModeUI();
  updateUserIdModeUI();
} else {
  // URL params were restored, but still restore hardware selection from localStorage if not in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("hw")) {
    restoreCrackHardwareSelection();
  }
  // updatePasswordModeUI is already called in restoreSettingsFromURL
}

// Recompute crack time after restoring settings (if password exists)
// Use setTimeout to ensure DOM is fully ready
setTimeout(() => {
  updateCrackTimeFromSettings();
  // Clean URL after applying settings (nice UX)
  if (urlParamsRestored) {
    clearUrlParams();
  }
}, 0);

// Load word lists - they should be loaded via script tags before this script runs
loadWordLists();