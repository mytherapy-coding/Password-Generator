// ------------------------------
// TAB SWITCHING
// ------------------------------
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ------------------------------
// CONSTANTS
// ------------------------------
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const VOWELS = "aeiouy";
const DIGITS = "0123456789";
const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?";

// ------------------------------
// WORD LISTS (STEP 2 ADDITION)
// ------------------------------
let WORD_ADJECTIVES = [];
let WORD_NOUNS = [];
let wordsLoaded = false;

// ------------------------------
// RANDOM HELPERS
// ------------------------------
function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pick(pool) {
  return pool[randomInt(pool.length)];
}

// ------------------------------
// SYMBOL VALIDATION
// ------------------------------
function validateSymbolsInput(text) {
  if (!text) {
    return { ok: false, msg: "Please enter at least 1 symbol (e.g., !@#$)." };
  }

  if (/\s/.test(text)) {
    return { ok: false, msg: "Spaces are not allowed in the symbols set." };
  }

  if (/[a-zA-Z0-9]/.test(text)) {
    return { ok: false, msg: "Symbols must not include letters or digits." };
  }

  const unique = [...new Set(text)].join("");
  if (!unique) {
    return { ok: false, msg: "Your symbols set is empty after validation." };
  }

  return { ok: true, symbols: unique };
}

// ------------------------------
// CHARSET BUILDER
// ------------------------------
function getCharset(options) {
  let pool = "";

  if (options.useLower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (options.useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.useDigits) pool += "0123456789";
  if (options.useSymbols) pool += options.symbols;

  if (!pool) {
    return { ok: false, msg: "Select at least one character type." };
  }

  return { ok: true, pool };
}

// ------------------------------
// PASSWORD GENERATOR
// ------------------------------
function generatePassword(options) {
  const { length, pool } = options;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += pick(pool);
  }

  return result;
}

// ------------------------------
// iCLOUD PASSWORD GENERATOR
// ------------------------------
function generateSyllable() {
  return pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS);
}

function generateChunk6() {
  return generateSyllable() + generateSyllable();
}

function generateIcloudPassword() {
  let chunks = [
    generateChunk6(),
    generateChunk6(),
    generateChunk6()
  ];

  let password = chunks.join("-");

  const candidatePositions = [];
  for (let i = 0; i < password.length; i++) {
    if (password[i] === "-") {
      if (i - 1 >= 0) candidatePositions.push(i - 1);
      if (i + 1 < password.length) candidatePositions.push(i + 1);
    }
  }
  candidatePositions.push(password.length - 1);

  const digitPos = randomInt(candidatePositions.length);
  const digit = pick(DIGITS);
  password = password.slice(0, candidatePositions[digitPos]) + digit + password.slice(candidatePositions[digitPos] + 1);

  const validUpperPositions = [];
  for (let i = 0; i < password.length; i++) {
    const ch = password[i];
    if (ch === "-" || /\d/.test(ch)) continue;
    validUpperPositions.push(i);
  }

  const upperPos = randomInt(validUpperPositions.length);
  const upperChar = password[validUpperPositions[upperPos]].toUpperCase();
  password = password.slice(0, validUpperPositions[upperPos]) + upperChar + password.slice(validUpperPositions[upperPos] + 1);

  return password;
}

// ------------------------------
// USER ID GENERATOR (CVC MODE)
// ------------------------------
function generateCvcStem(syllablesCount) {
  let stem = "";
  for (let i = 0; i < syllablesCount; i++) {
    stem += pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS);
  }
  return stem;
}

function normalizeSuffix(text) {
  return text.trim().toLowerCase();
}

function validateUserIdOptions(options) {
  const { syllables, addDigits, digitsCount, addSuffix, suffix, maxLength } = options;

  if (addSuffix && suffix.length > 0) {
    if (/[^a-z0-9]/i.test(suffix)) {
      return { ok: false, msg: "Suffix can contain only letters and digits." };
    }
  }

  const base = 3 * syllables;
  const digits = addDigits ? digitsCount : 0;
  const suffixLen = addSuffix && suffix.length > 0 ? (1 + suffix.length) : 0;

  const minLen = base + digits + suffixLen;

  if (maxLength < minLen) {
    return { ok: false, msg: "Max length is too small for the selected options." };
  }

  return { ok: true };
}

function generateUserId(options) {
  const { syllables, addDigits, digitsCount, addSuffix, suffix, maxLength } = options;

  let id = generateCvcStem(syllables);

  if (addDigits) {
    for (let i = 0; i < digitsCount; i++) {
      id += pick(DIGITS);
    }
  }

  if (addSuffix && suffix.length > 0) {
    id += "_" + suffix;
  }

  if (!/^[a-z]/.test(id)) return null;
  if (id.length > maxLength) return null;

  return id;
}

function generateUserIdList(options, count) {
  const results = new Set();
  let attempts = 0;

  while (results.size < count && attempts < 50) {
    const id = generateUserId(options);
    if (id) results.add(id);
    attempts++;
  }

  if (results.size < count) {
    return { ok: false, msg: "Could not generate valid usernames. Increase max length." };
  }

  return { ok: true, list: Array.from(results) };
}

// ------------------------------
// ENTROPY + STRENGTH
// ------------------------------
function calculateEntropyBits(length, poolSize) {
  return length * Math.log2(poolSize);
}

function strengthLabel(bits) {
  if (bits < 45) return { label: "Weak", color: "red" };
  if (bits < 70) return { label: "Medium", color: "orange" };
  return { label: "Strong", color: "green" };
}

// ------------------------------
// CLIPBOARD
// ------------------------------
async function copyToClipboard(text) {
  if (!text) {
    return { ok: false, msg: "Generate a password first." };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, msg: "Could not copy. Please copy manually." };
  }
}

// ------------------------------
// DOM ELEMENTS
// ------------------------------
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

// USER ID DOM
const uidSyllables = document.getElementById("uidSyllables");
const uidAddDigits = document.getElementById("uidAddDigits");
const uidDigitsCount = document.getElementById("uidDigitsCount");
const uidAddSuffix = document.getElementById("uidAddSuffix");
const uidSuffix = document.getElementById("uidSuffix");
const uidMaxLength = document.getElementById("uidMaxLength");
const uidCount = document.getElementById("uidCount");
const uidGenerateBtn = document.getElementById("uidGenerateBtn");
const uidError = document.getElementById("uidError");
const uidResults = document.getElementById("uidResults");

// ------------------------------
// STEP 2: NEW DOM REFERENCES
// ------------------------------
const uidMode = document.getElementById("uidMode");
const uidCvcControls = document.getElementById("uidCvcControls");
const uidWordsControls = document.getElementById("uidWordsControls");

const uidWordsCount = document.getElementById("uidWordsCount");
const uidWordsSeparator = document.getElementById("uidWordsSeparator");
const uidWordsAddDigits = document.getElementById("uidWordsAddDigits");
const uidWordsDigitsCount = document.getElementById("uidWordsDigitsCount");
const uidWordsMaxLength = document.getElementById("uidWordsMaxLength");

// ------------------------------
// PERSISTENCE HELPERS (unchanged from Part 5)
// ------------------------------
function savePasswordSettings() {
  const config = {
    length: Number(lengthInput.value),
    useLower: lowercaseCheckbox.checked,
    useUpper: uppercaseCheckbox.checked,
    useDigits: digitsCheckbox.checked,
    useSymbols: symbolsCheckbox.checked,
    customSymbols: customSymbolsInput.value,
    icloudPreset: icloudPresetCheckbox.checked
  };

  localStorage.setItem("passwordSettings", JSON.stringify(config));
}

function loadPasswordSettings() {
  const raw = localStorage.getItem("passwordSettings");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    console.warn("Password settings corrupted — using defaults.");
    return null;
  }
}

function saveUserIdSettings() {
  const config = {
    mode: uidMode.value,

    // CVC mode
    syllables: Number(uidSyllables.value),
    addDigits: uidAddDigits.checked,
    digitsCount: Number(uidDigitsCount.value),
    addSuffix: uidAddSuffix.checked,
    suffix: uidSuffix.value,
    maxLength: Number(uidMaxLength.value),

    // Words mode (will be used in Step 3)
    wordsCount: Number(uidWordsCount.value),
    wordsSeparator: uidWordsSeparator.value,
    wordsAddDigits: uidWordsAddDigits.checked,
    wordsDigitsCount: Number(uidWordsDigitsCount.value),
    wordsMaxLength: Number(uidWordsMaxLength.value),

    // Shared
    count: Number(uidCount.value)
  };

  localStorage.setItem("userIdSettings", JSON.stringify(config));
}

function loadUserIdSettings() {
  const raw = localStorage.getItem("userIdSettings");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    console.warn("User ID settings corrupted — using defaults.");
    return null;
  }
}

// ------------------------------
// RESTORE UI STATE
// ------------------------------
function showRestoredNotice(text) {
  const el = document.getElementById("restoreNotice");
  el.textContent = text;

  setTimeout(() => {
    el.textContent = "";
  }, 2500);
}

function restorePasswordUI() {
  const config = loadPasswordSettings();
  if (!config) return;

  if (typeof config.length === "number" && config.length >= 4 && config.length <= 64) {
    lengthInput.value = config.length;
  }

  lowercaseCheckbox.checked = !!config.useLower;
  uppercaseCheckbox.checked = !!config.useUpper;
  digitsCheckbox.checked = !!config.useDigits;
  symbolsCheckbox.checked = !!config.useSymbols;

  if (typeof config.customSymbols === "string") {
    customSymbolsInput.value = config.customSymbols;
  }

  icloudPresetCheckbox.checked = !!config.icloudPreset;

  updateIcloudUIState();
  updateGenerateButtonState();

  showRestoredNotice("Password settings restored from previous session");
}

function restoreUserIdUI() {
  const config = loadUserIdSettings();
  if (!config) {
    updateUserIdModeUI();
    return;
  }

  if (config.mode === "cvc" || config.mode === "words") {
    uidMode.value = config.mode;
  }

  if (config.syllables === 2 || config.syllables === 3) {
    uidSyllables.value = config.syllables;
  }

  uidAddDigits.checked = !!config.addDigits;
  uidDigitsCount.value = config.digitsCount || 2;

  uidAddSuffix.checked = !!config.addSuffix;
  uidSuffix.value = config.suffix || "";

  uidMaxLength.value = config.maxLength || 15;

  if (config.wordsCount === 2 || config.wordsCount === 3) {
    uidWordsCount.value = config.wordsCount;
  }

  if (["_", ".", "-", "none"].includes(config.wordsSeparator)) {
    uidWordsSeparator.value = config.wordsSeparator;
  }

  uidWordsAddDigits.checked = !!config.wordsAddDigits;
  uidWordsDigitsCount.value = config.wordsDigitsCount || 2;

  uidWordsMaxLength.value = config.wordsMaxLength || 20;

  uidCount.value = config.count || 10;

  uidDigitsCount.disabled = !uidAddDigits.checked;
  uidSuffix.disabled = !uidAddSuffix.checked;

  updateUserIdModeUI();

  showRestoredNotice("User ID settings restored from previous session");
}

// ------------------------------
// UI STATE
// ------------------------------
function updateIcloudUIState() {
  const on = icloudPresetCheckbox.checked;

  lengthInput.disabled = on;
  lowercaseCheckbox.disabled = on;
  uppercaseCheckbox.disabled = on;
  digitsCheckbox.disabled = on;
  symbolsCheckbox.disabled = on;
  customSymbolsInput.disabled = on;

  presetInfo.textContent = on ? "iCloud preset is active: settings are fixed." : "";
}

// ------------------------------
// STEP 2: USER ID MODE UI
// ------------------------------
function updateUserIdModeUI() {
  const mode = uidMode.value;

  if (mode === "cvc") {
    uidCvcControls.style.display = "";
    uidWordsControls.style.display = "none";
  } else {
    uidCvcControls.style.display = "none";
    uidWordsControls.style.display = "";
  }
}

// ------------------------------
// LOAD WORD LISTS (STEP 2)
// ------------------------------
async function loadWordLists() {
  try {
    const [adjsRes, nounsRes] = await Promise.all([
      fetch("data/adjs.json"),
      fetch("data/nouns.json")
    ]);

    if (!adjsRes.ok || !nounsRes.ok) {
      throw new Error("Network error");
    }

    const adjsJson = await adjsRes.json();
    const nounsJson = await nounsRes.json();

    WORD_ADJECTIVES = (adjsJson.adjs || adjsJson)
      .map(w => w.toLowerCase().replace(/[^a-z]/g, ""))
      .filter(Boolean);

    WORD_NOUNS = (nounsJson.nouns || nounsJson)
      .map(w => w.toLowerCase().replace(/[^a-z]/g, ""))
      .filter(Boolean);

    wordsLoaded = true;
  } catch (e) {
    console.error("Failed to load word lists", e);
    uidError.textContent = "Could not load word lists. Please refresh the page.";
  }
}

// ------------------------------
// PASSWORD GENERATE HANDLER
// ------------------------------
function handleGenerate() {
  if (icloudPresetCheckbox.checked) {
    presetInfo.textContent = "iCloud preset is active: length and character sets are fixed.";

    const password = generateIcloudPassword();
    passwordInput.value = password;

    strengthLabelEl.textContent = "Strength: Strong";
    strengthBarEl.style.background = "green";
    return;
  }

  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  presetInfo.textContent = "";

  const length = Number(lengthInput.value);
  if (Number.isNaN(length) || length < 4 || length > 64) {
    lengthError.textContent = "Password length must be between 4 and 64.";
    return;
  }

  const options = {
    length,
    useLower: lowercaseCheckbox.checked,
    useUpper: uppercaseCheckbox.checked,
    useDigits: digitsCheckbox.checked,
    useSymbols: symbolsCheckbox.checked,
    symbols: ""
  };

  if (options.useSymbols) {
    const raw = customSymbolsInput.value.trim();

    if (raw === "") {
      options.symbols = DEFAULT_SYMBOLS;
    } else {
      const result = validateSymbolsInput(raw);
      if (!result.ok) {
        symbolError.textContent = result.msg;
        return;
      }
      options.symbols = result.symbols;
    }
  }

  const charsetResult = getCharset(options);
  if (!charsetResult.ok) {
    symbolError.textContent = charsetResult.msg;
    return;
  }

  const pool = charsetResult.pool;
  const password = generatePassword({ length, pool });
  passwordInput.value = password;

  const bits = calculateEntropyBits(length, pool.length);
  const strength = strengthLabel(bits);

  strengthLabelEl.textContent = `Strength: ${strength.label}`;
  strengthBarEl.style.background = strength.color;
}

// ------------------------------
// USER ID GENERATE HANDLER (CVC ONLY FOR NOW)
// ------------------------------
function handleGenerateUserIds() {
  uidError.text