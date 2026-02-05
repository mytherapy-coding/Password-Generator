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
  const chars = [];

  for (let i = 0; i < length; i++) {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % pool.length;
    chars.push(pool[idx]);
  }

  return chars.join("");
}

function generateIcloudPassword() {}

// --- Entropy + strength ---
function calculateEntropyBits(length, poolSize) {}
function strengthLabel(bits) {}

// --- Clipboard ---
async function copyToClipboard(text) {}

// --- Main handler ---
ffunction handleGenerate() {
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
    useSymbols: false, // symbols come later
    symbols: ""
  };

  // Build charset
  const charsetResult = getCharset(options);
  if (!charsetResult.ok) {
    symbolError.textContent = charsetResult.msg;
    return;
  }

  const pool = charsetResult.pool;

  // Generate password
  const password = generatePassword({ length, pool });

  // Show password
  passwordInput.value = password;

  // Reset strength bar for now (entropy comes later)
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "#475569";
}

function handleClear() {}
function handleCopy() {}

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

// Press Enter to generate
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement !== customSymbolsInput) {
    handleGenerate();
  }
});


function handleGenerate() {
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

  // Show password
  passwordInput.value = password;

  // Reset strength bar (entropy comes later)
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "#475569";
}


function handleClear() {
  passwordInput.value = "";
  strengthLabelEl.textContent = "";
  strengthBarEl.style.background = "#475569";
  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  presetInfo.textContent = "";
}

async function handleCopy() {
  console.log("Copy clicked");
}
