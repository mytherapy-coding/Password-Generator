const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const VOWELS = "aeiouy";
const DIGITS = "0123456789";
const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?";

function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pick(pool) {
  return pool[randomInt(pool.length)];
}


// --- Validation ---
function validateSymbolsInput(text) {
  if (!text) {
    return { ok: false, msg: "Please enter at least 1 symbol (e.g., !@#$)." };
  }

  if (/\s/.test(text)) {
    return { ok: false, msg: "Spaces are not allowed in the symbols set." };
  }

  if (/[a-zA-Z0-9]/.test(text)) {
    return { ok: false, msg: "Symbols must not include letters (A–Z) or digits (0–9)." };
  }

  const unique = [...new Set(text)].join("");
  if (!unique) {
    return { ok: false, msg: "Your symbols set is empty after validation. Please add at least 1 symbol." };
  }

  return { ok: true, symbols: unique };
}


// --- Charset builder ---
function getCharset(options) {
  let pool = "";

  if (options.useLower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (options.useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.useDigits) pool += "0123456789";
  if (options.useSymbols) pool += options.symbols;

  if (!pool) {
    return { ok: false, msg: "Select at least one character type to generate a password." };
  }

  return { ok: true, pool };
}


// --- Generators ---
function generatePassword(options) {
  const { length, pool } = options;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += pick(pool);
  }

  return result;
}

function generateSyllable() {
  return pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS);
}

function generateChunk6() {
  return generateSyllable() + generateSyllable(); // CVC + CVC
}

function generateIcloudPassword() {
  // 1) Build 3 chunks
  let chunks = [
    generateChunk6(),
    generateChunk6(),
    generateChunk6()
  ];

  let password = chunks.join("-"); // XXXXXX-XXXXXX-XXXXXX

  // 2) Insert digit near hyphens or end
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

  // 3) Insert uppercase (not hyphen, not digit)
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




// --- Entropy + strength ---
function calculateEntropyBits(length, poolSize) {
  return length * Math.log2(poolSize);
}

function strengthLabel(bits) {
  if (bits < 45) return { label: "Weak", color: "red" };
  if (bits < 70) return { label: "Medium", color: "orange" };
  return { label: "Strong", color: "green" };
}


// --- Clipboard ---
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


// --- Main handler ---
function handleGenerate() {
  // iCloud preset mode
  if (icloudPresetCheckbox.checked) {
    presetInfo.textContent = "iCloud preset is active: length and character sets are fixed.";

    const password = generateIcloudPassword();
    passwordInput.value = password;

    strengthLabelEl.textContent = "Strength: Strong";
    strengthBarEl.style.background = "green";
    return;
  }

  // Clear previous errors
  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  presetInfo.textContent = "";

  // Read length
  const length = Number(lengthInput.value);
  if (Number.isNaN(length) || length < 4 || length > 64) {
    lengthError.textContent = "Password length must be between 4 and 64.";
    return;
  }

  // Read character type selections
  const options = {
    length,
    useLower: lowercaseCheckbox.checked,
    useUpper: uppercaseCheckbox.checked,
    useDigits: digitsCheckbox.checked,
    useSymbols: symbolsCheckbox.checked,
    symbols: ""
  };

  // Validate symbols if enabled
  if (options.useSymbols) {
    const result = validateSymbolsInput(customSymbolsInput.value);
    if (!result.ok) {
      symbolError.textContent = result.msg;
      return;
    }
    options.symbols = result.symbols;
  }

  // Build charset
  const charsetResult = getCharset(options);
  if (!charsetResult.ok) {
    symbolError.textContent = charsetResult.msg;
    return;
  }

  const pool = charsetResult.pool;

  // Generate password
  const password = generatePassword({ length, pool });
  passwordInput.value = password;

  // Calculate entropy
  const bits = calculateEntropyBits(length, pool.length);
  const strength = strengthLabel(bits);

  strengthLabelEl.textContent = `Strength: ${strength.label}`;
  strengthBarEl.style.background = strength.color;
}


// --- Clear ---
function handleClear() {
  passwordInput.value = "";
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "#475569";
  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  presetInfo.textContent = "";
}


// --- Copy ---
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


// --- DOM elements ---
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


// --- Event listeners ---
generateBtn.addEventListener("click", handleGenerate);
clearBtn.addEventListener("click", handleClear);
copyBtn.addEventListener("click", handleCopy);

lengthInput.addEventListener("input", updateGenerateButtonState);
lowercaseCheckbox.addEventListener("change", updateGenerateButtonState);
uppercaseCheckbox.addEventListener("change", updateGenerateButtonState);
digitsCheckbox.addEventListener("change", updateGenerateButtonState);
symbolsCheckbox.addEventListener("change", updateGenerateButtonState);
customSymbolsInput.addEventListener("input", updateGenerateButtonState);
icloudPresetCheckbox.addEventListener("change", updateGenerateButtonState);


// Press Enter to generate
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement !== customSymbolsInput) {
    handleGenerate();
  }
});


// --- Real-time button state ---
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
