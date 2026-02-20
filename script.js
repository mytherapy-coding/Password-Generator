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
  let chunks = [generateChunk6(), generateChunk6(), generateChunk6()];
  let pwd = chunks.join("-");

  const positions = [];
  for (let i = 0; i < pwd.length; i++) {
    if (pwd[i] === "-") {
      if (i - 1 >= 0) positions.push(i - 1);
      if (i + 1 < pwd.length) positions.push(i + 1);
    }
  }
  positions.push(pwd.length - 1);

  const pos = pick(positions);
  pwd = pwd.slice(0, pos) + pick(DIGITS) + pwd.slice(pos + 1);

  const letters = [];
  for (let i = 0; i < pwd.length; i++) {
    if (/[a-z]/.test(pwd[i])) letters.push(i);
  }
  const up = pick(letters);
  pwd = pwd.slice(0, up) + pwd[up].toUpperCase() + pwd.slice(up + 1);

  return pwd;
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
const lengthInput = document.getElementById("length");
const lowercaseCheckbox = document.getElementById("lowercase");
const uppercaseCheckbox = document.getElementById("uppercase");
const digitsCheckbox = document.getElementById("digits");
const symbolsCheckbox = document.getElementById("symbols");
const customSymbolsInput = document.getElementById("customSymbols");
const icloudPresetCheckbox = document.getElementById("icloudPreset");

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

/* Crack-time DOM */
const crackTimeContainer = document.getElementById("crackTimeContainer");
const crackHardwareSelect = document.getElementById("crackHardware");
const crackTimeEntropy = document.getElementById("crackTimeEntropy");
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
function updateIcloudUIState() {
  const on = icloudPresetCheckbox.checked;
  lengthInput.disabled = on;
  lowercaseCheckbox.disabled = on;
  uppercaseCheckbox.disabled = on;
  digitsCheckbox.disabled = on;
  symbolsCheckbox.disabled = on;
  customSymbolsInput.disabled = on;

  presetInfo.textContent = on ? "iCloud preset is active." : "";
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

  // Calculate keyspace: K = 2^H
  const keyspace = Math.pow(2, entropyBits);
  
  // Calculate expected crack time: T = 0.5 * K / R
  const seconds = estimateCrackTimeSeconds(entropyBits, guessesPerSecond);
  const formatted = formatCrackTime(seconds);

  // Display entropy and keyspace info
  const entropyDisplay = document.getElementById("crackTimeEntropy");
  if (entropyDisplay) {
    const keyspaceFormatted = keyspace > 1e15 
      ? keyspace.toExponential(2) 
      : keyspace.toLocaleString();
    entropyDisplay.textContent = `Entropy: ${entropyBits.toFixed(1)} bits | Keyspace: ${keyspaceFormatted} possible passwords`;
  }

  crackTimeContainer.style.display = "";
  crackTimeValue.textContent = `Estimated crack time: ≈ ${formatted}`;
  crackTimeWarning.textContent = "";

  if (entropyBits < 20) {
    crackTimeWarning.textContent =
      "⚠️ This password is extremely weak and can be cracked almost instantly in an offline attack.";
  } else if (entropyBits < 45) {
    crackTimeWarning.textContent =
      "⚠️ This password is weak. Consider increasing length or adding more character types.";
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, profileKey);
  } catch {
    // ignore
  }
}

/* ------------------------------
   PASSWORD PERSISTENCE
------------------------------ */
function savePasswordSettings() {
  const settings = {
    length: lengthInput.value,
    lowercase: lowercaseCheckbox.checked,
    uppercase: uppercaseCheckbox.checked,
    digits: digitsCheckbox.checked,
    symbols: symbolsCheckbox.checked,
    customSymbols: customSymbolsInput.value,
    icloudPreset: icloudPresetCheckbox.checked
  };
  localStorage.setItem("passwordSettings", JSON.stringify(settings));
}

function restorePasswordSettings() {
  const raw = localStorage.getItem("passwordSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    lengthInput.value = s.length ?? "12";
    lowercaseCheckbox.checked = s.lowercase ?? true;
    uppercaseCheckbox.checked = s.uppercase ?? true;
    digitsCheckbox.checked = s.digits ?? true;
    symbolsCheckbox.checked = s.symbols ?? false;
    customSymbolsInput.value = s.customSymbols ?? "";
    icloudPresetCheckbox.checked = s.icloudPreset ?? false;
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
  crackTimeWarning.textContent = "";
  crackTimeContainer.style.display = "none";

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

  const length = Number(lengthInput.value);
  if (length < 4 || length > 64) {
    lengthError.textContent = "Length must be 4–64.";
    crackTimeContainer.style.display = "none";
    return;
  }

  let symbols = "";
  if (symbolsCheckbox.checked) {
    const val = validateSymbolsInput(customSymbolsInput.value);
    if (!val.ok) {
      symbolError.textContent = val.msg;
      crackTimeContainer.style.display = "none";
      return;
    }
    symbols = val.symbols;
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

  const pwd = generatePassword({ length, pool: charset.pool });
  passwordInput.value = pwd;

  const bits = calculateEntropyBits(length, charset.pool.length);
  strengthLabelEl.textContent = bits < 45 ? "Weak" : bits < 70 ? "Medium" : "Strong";
  strengthBarEl.style.background = bits < 45 ? "red" : bits < 70 ? "orange" : "green";

  updateCrackTimeUI(bits);
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
      uidError.textContent = "Word lists are empty. Please check data/adjs.json and data/nouns.json files.";
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
   EVENT LISTENERS
------------------------------ */
generateBtn.addEventListener("click", handleGeneratePassword);
clearBtn.addEventListener("click", () => {
  passwordInput.value = "";
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "gray";
  copyError.textContent = "";
  crackTimeContainer.style.display = "none";
  crackTimeWarning.textContent = "";
});
copyBtn.addEventListener("click", async () => {
  if (!(await copyToClipboard(passwordInput.value))) {
    copyError.textContent = "Copy failed.";
  }
});

[
  lengthInput, lowercaseCheckbox, uppercaseCheckbox, digitsCheckbox,
  symbolsCheckbox, customSymbolsInput
].forEach((el) => {
  el.addEventListener("change", savePasswordSettings);
});
customSymbolsInput.addEventListener("input", savePasswordSettings);

icloudPresetCheckbox.addEventListener("change", () => {
  updateIcloudUIState();
  savePasswordSettings();
  crackTimeContainer.style.display = "none";
  crackTimeWarning.textContent = "";
});

uidMode.addEventListener("change", () => {
  updateUserIdModeUI();
  saveUserIdSettings();
});
uidGenerateBtn.addEventListener("click", handleGenerateUserIds);

[
  uidSyllables, uidAddDigits, uidDigitsCount, uidAddSuffix, uidSuffix, uidMaxLength,
  uidWordsCount, uidWordsSeparator, uidWordsAddDigits, uidWordsDigitsCount, uidWordsMaxLength,
  uidCount
].forEach((el) => {
  el.addEventListener("change", saveUserIdSettings);
});

crackHardwareSelect.addEventListener("change", () => {
  // Recompute crack time for current password if any
  const pwd = passwordInput.value;
  if (!pwd) {
    crackTimeContainer.style.display = "none";
    crackTimeWarning.textContent = "";
    try {
      localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, crackHardwareSelect.value);
    } catch {
      // ignore
    }
    return;
  }

  if (icloudPresetCheckbox.checked) {
    updateCrackTimeUI(71);
    return;
  }

  const length = Number(lengthInput.value);
  let symbols = "";
  if (symbolsCheckbox.checked) {
    const val = validateSymbolsInput(customSymbolsInput.value);
    if (!val.ok) {
      crackTimeContainer.style.display = "none";
      return;
    }
    symbols = val.symbols;
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

  const bits = calculateEntropyBits(length, charset.pool.length);
  updateCrackTimeUI(bits);
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

restorePasswordSettings();
restoreUserIdSettings();
updateIcloudUIState();
updateUserIdModeUI();
restoreCrackHardwareSelection();

// Load word lists - they should be loaded via script tags before this script runs
loadWordLists();