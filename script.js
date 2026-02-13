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
// PERSISTENCE HELPERS
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
    syllables: Number(uidSyllables.value),
    addDigits: uidAddDigits.checked,
    digitsCount: Number(uidDigitsCount.value),
    addSuffix: uidAddSuffix.checked,
    suffix: uidSuffix.value,
    maxLength: Number(uidMaxLength.value),
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
// RESTORE UI STATE
// ------------------------------
function restorePasswordUI() {
  const config = loadPasswordSettings();
  if (!config) return;

  // Validate before applying
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
  if (!config) return;

  if (config.syllables === 2 || config.syllables === 3) {
    uidSyllables.value = config.syllables;
  }

  uidAddDigits.checked = !!config.addDigits;
  uidDigitsCount.value = config.digitsCount || 2;

  uidAddSuffix.checked = !!config.addSuffix;
  uidSuffix.value = config.suffix || "";

  uidMaxLength.value = config.maxLength || 15;
  uidCount.value = config.count || 10;

  uidDigitsCount.disabled = !uidAddDigits.checked;
  uidSuffix.disabled = !uidAddSuffix.checked;

  showRestoredNotice("User ID settings restored from previous session");
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
// USER ID GENERATOR
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
// USER ID GENERATE HANDLER
// ------------------------------
function handleGenerateUserIds() {
  uidError.textContent = "";
  uidResults.innerHTML = "";

  const options = {
    syllables: Number(uidSyllables.value),
    addDigits: uidAddDigits.checked,
    digitsCount: Number(uidDigitsCount.value),
    addSuffix: uidAddSuffix.checked,
    suffix: normalizeSuffix(uidSuffix.value),
    maxLength: Number(uidMaxLength.value)
  };

  const validation = validateUserIdOptions(options);
  if (!validation.ok) {
    uidError.textContent = validation.msg;
    return;
  }

  const count = Number(uidCount.value);
  const result = generateUserIdList(options, count);

  if (!result.ok) {
    uidError.textContent = result.msg;
    return;
  }

  result.list.forEach(id => {
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

// ------------------------------
// CLEAR
// ------------------------------
function handleClear() {
  passwordInput.value = "";
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "#475569";
  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  presetInfo.textContent = "";
}

// ------------------------------
// COPY
// ------------------------------
async function handleCopy() {
  const text = passwordInput.value.trim();
  const result = await copyToClipboard(text);

  if (!result.ok) {
    copyError.textContent = result.msg;
    return;
  }

  copyError.style.color = "#38bdf8";
  copyError.textContent = "Copied!";

  setTimeout(() => {
    copyError.textContent = "";
    copyError.style.color = "#f87171";
  }, 1500);
}

// ------------------------------
// EVENT LISTENERS
// ------------------------------
generateBtn.addEventListener("click", handleGenerate);
clearBtn.addEventListener("click", handleClear);
copyBtn.addEventListener("click", handleCopy);

icloudPresetCheckbox.addEventListener("change", () => {
  updateIcloudUIState();
  updateGenerateButtonState();
});

// USER ID LISTENERS
uidAddDigits.addEventListener("change", () => {
  uidDigitsCount.disabled = !uidAddDigits.checked;
});

uidAddSuffix.addEventListener("change", () => {
  uidSuffix.disabled = !uidAddSuffix.checked;
});

uidGenerateBtn.addEventListener("click", handleGenerateUserIds);

// ------------------------------
// REAL-TIME BUTTON STATE
// ------------------------------
function updateGenerateButtonState() {
  const length = Number(lengthInput.value);
  const lengthValid = !Number.isNaN(length) && length >= 4 && length <= 64;

  const anyCharset =
    lowercaseCheckbox.checked ||
    uppercaseCheckbox.checked ||
    digitsCheckbox.checked ||
    symbolsCheckbox.checked;

  let symbolsValid = true;
  if (symbolsCheckbox.checked) {
    const result = validateSymbolsInput(customSymbolsInput.value);
    symbolsValid = result.ok;
  }

  if (icloudPresetCheckbox.checked) {
    generateBtn.disabled = false;
    return;
  }

  generateBtn.disabled = !(lengthValid && anyCharset && symbolsValid);
}

updateGenerateButtonState();
updateIcloudUIState();
