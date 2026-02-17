/* ============================================================
   CLEAN, FULLY WORKING SCRIPT.JS — WITH CRACK-TIME ESTIMATION
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

  const sep = opts.separator === "none" ? "" : opts.separator;

  for (let attempt = 0; attempt < 50; attempt++) {
    const words = [];

    if (opts.wordsCount === 2) {
      words.push(
        WORD_ADJECTIVES[randomInt(WORD_ADJECTIVES.length)],
        WORD_NOUNS[randomInt(WORD_NOUNS.length)]
      );
    } else {
      words.push(
        WORD_ADJECTIVES[randomInt(WORD_ADJECTIVES.length)],
        WORD_ADJECTIVES[randomInt(WORD_ADJECTIVES.length)],
        WORD_NOUNS[randomInt(WORD_NOUNS.length)]
      );
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
function formatCrackTime(seconds) {
  if (seconds < 1) return "< 1 second";

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const year = 365 * day;

  if (seconds < minute) return `~${Math.round(seconds)} seconds`;
  if (seconds < hour) return `~${Math.round(seconds / minute)} minutes`;
  if (seconds < day) return `~${Math.round(seconds / hour)} hours`;
  if (seconds < week) return `~${Math.round(seconds / day)} days`;
  if (seconds < year) return `~${Math.round(seconds / week)} weeks`;

  const years = seconds / year;
  if (years < 1e6) {
    const rounded = years < 10 ? years.toFixed(1) : Math.round(years);
    return `~${rounded} years`;
  }

  return "> 10 million years";
}

function estimateCrackTimeSeconds(entropyBits, guessesPerSecond) {
  const keyspace = Math.pow(2, entropyBits);
  const expectedGuesses = 0.5 * keyspace;
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

  const seconds = estimateCrackTimeSeconds(entropyBits, guessesPerSecond);
  const formatted = formatCrackTime(seconds);

  crackTimeContainer.style.display = "";
  crackTimeValue.textContent = `≈ ${formatted}`;
  crackTimeWarning.textContent = "";

  if (entropyBits < 20) {
    crackTimeWarning.textContent =
      "This password is extremely weak and can be cracked almost instantly in an offline attack.";
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, profileKey);
  } catch {
    // ignore
  }
}

/* ------------------------------
   WORD LIST LOADING
------------------------------ */
async function loadWordLists() {
  try {
    const [a, n] = await Promise.all([
      fetch("data/adjs.json"),
      fetch("data/nouns.json")
    ]);

    const adjs = await a.json();
    const nouns = await n.json();

    WORD_ADJECTIVES = (adjs.adjs || adjs).map(normalizeWord).filter(Boolean);
    WORD_NOUNS = (nouns.nouns || nouns).map(normalizeWord).filter(Boolean);

    wordsLoaded = true;
  } catch (e) {
    uidError.textContent = "Failed to load word lists.";
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
      uidError.textContent = "Could not generate valid IDs. Increase max length.";
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
  crackTimeContainer.style.display = "none";
  crackTimeWarning.textContent = "";
});
copyBtn.addEventListener("click", async () => {
  if (!(await copyToClipboard(passwordInput.value))) {
    copyError.textContent = "Copy failed.";
  }
});

icloudPresetCheckbox.addEventListener("change", () => {
  updateIcloudUIState();
  crackTimeContainer.style.display = "none";
  crackTimeWarning.textContent = "";
});

uidMode.addEventListener("change", updateUserIdModeUI);
uidGenerateBtn.addEventListener("click", handleGenerateUserIds);

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

updateIcloudUIState();
updateUserIdModeUI();
restoreCrackHardwareSelection();
loadWordLists();
