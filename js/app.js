/**
 * Main application logic
 * Handles password generation, user ID generation, and UI updates
 */

import { randomInt } from "./random.js";
import {
  generatePassword,
  generateIcloudPassword,
  generateEasyWritePassword,
  generateEasySayPassword,
  generatePassphrase,
  generateCvcId,
  generateWordsId,
  normalizeWord,
  calculateEntropyBits,
  estimateCrackTimeSeconds,
  formatCrackTime,
  CRACK_HARDWARE_PROFILES,
  validateSymbolsInput,
  getCharset,
  SAFE_SYMBOLS,
  UNAMBIGUOUS_LOWERCASE,
  UNAMBIGUOUS_UPPERCASE,
  UNAMBIGUOUS_DIGITS,
  EASY_SAY_CONSONANTS,
  VOWELS
} from "../core/index.js";
import { updateCrackTimeUI } from "./ui.js";
import { savePasswordSettings, saveUserIdSettings, saveCrackHardware } from "./storage.js";
import { buildPasswordShareUrl, buildUserIdShareUrl, copyShareUrl } from "./share.js";

// Word lists (loaded from JSON)
let WORD_ADJECTIVES = [];
let WORD_NOUNS = [];
let DICEWARE_WORDS = [];
let wordsLoaded = false;
let dicewareLoaded = false;

/**
 * Load word lists from JSON files
 */
export async function loadWordLists() {
  try {
    const [adjsRes, nounsRes, dicewareRes] = await Promise.all([
      fetch("./data/adjs.json"),
      fetch("./data/nouns.json"),
      fetch("./data/diceware_words.json")
    ]);
    
    if (adjsRes.ok && nounsRes.ok) {
      WORD_ADJECTIVES = (await adjsRes.json()).map(normalizeWord).filter(Boolean);
      WORD_NOUNS = (await nounsRes.json()).map(normalizeWord).filter(Boolean);
      wordsLoaded = WORD_ADJECTIVES.length > 0 && WORD_NOUNS.length > 0;
      console.log(`Loaded ${WORD_ADJECTIVES.length} adjectives and ${WORD_NOUNS.length} nouns`);
    }
    
    if (dicewareRes.ok) {
      DICEWARE_WORDS = await dicewareRes.json();
      dicewareLoaded = DICEWARE_WORDS.length > 0;
      console.log(`Loaded ${DICEWARE_WORDS.length} Diceware words`);
    }
  } catch (err) {
    console.error("Error loading word lists:", err);
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handle password generation
 */
export function handleGeneratePassword(elements) {
  const {
    lengthError,
    symbolError,
    copyError,
    crackTimeContainer,
    passwordInput,
    strengthLabelEl,
    strengthBarEl,
    icloudPresetCheckbox,
    passwordMode,
    lengthInput,
    lowercaseCheckbox,
    uppercaseCheckbox,
    digitsCheckbox,
    symbolsCheckbox,
    customSymbolsInput,
    easyWriteLength,
    easySaySyllables,
    easySayAddDigit,
    passphraseWordCount,
    passphraseSeparator,
    passphraseCapitalize,
    passphraseAddDigits,
    crackHardwareSelect,
    crackTimeValue,
    crackTimeWarning
  } = elements;
  
  lengthError.textContent = "";
  symbolError.textContent = "";
  copyError.textContent = "";
  crackTimeContainer.style.display = "none";

  // iCloud preset takes precedence
  if (icloudPresetCheckbox.checked) {
    const pwd = generateIcloudPassword(randomInt);
    passwordInput.value = pwd;
    strengthLabelEl.textContent = "";
    strengthBarEl.style.background = "green";

    // iCloud preset: fixed entropy estimate (~71 bits)
    const entropyBits = 71;
    updateCrackTimeUI(entropyBits, elements);
    return;
  }

  const mode = passwordMode.value;
  let pwd = "";
  let entropyBits = 0;

  if (mode === "easyWrite") {
    const length = Number(easyWriteLength.value);
    if (length < 8 || length > 64) {
      lengthError.textContent = "Length must be 8–64 for Easy to write mode.";
      crackTimeContainer.style.display = "none";
      return;
    }
    
    pwd = generateEasyWritePassword(length, randomInt);
    
    const poolSize = UNAMBIGUOUS_LOWERCASE.length + UNAMBIGUOUS_UPPERCASE.length + 
                     UNAMBIGUOUS_DIGITS.length + SAFE_SYMBOLS.length;
    entropyBits = calculateEntropyBits(length, poolSize);
    
  } else if (mode === "easySay") {
    const syllableCount = Number(easySaySyllables.value);
    const addDigit = easySayAddDigit.checked;
    
    pwd = generateEasySayPassword(syllableCount, addDigit, randomInt);
    
    const syllableEntropy = Math.log2(EASY_SAY_CONSONANTS.length) + 
                           Math.log2(VOWELS.length) + 
                           Math.log2(EASY_SAY_CONSONANTS.length);
    entropyBits = syllableCount * syllableEntropy;
    if (addDigit) {
      entropyBits += Math.log2(UNAMBIGUOUS_DIGITS.length);
    }
    
  } else if (mode === "passphrase") {
    const wordCount = Number(passphraseWordCount.value);
    const separator = passphraseSeparator.value;
    const capitalize = passphraseCapitalize.checked;
    const addDigits = passphraseAddDigits.checked;
    
    if (!dicewareLoaded || DICEWARE_WORDS.length === 0) {
      lengthError.textContent = "Diceware word list not loaded. Please refresh the page.";
      crackTimeContainer.style.display = "none";
      return;
    }
    
    pwd = generatePassphrase({
      wordCount,
      separator,
      capitalize,
      addDigits
    }, DICEWARE_WORDS, randomInt);
    
    if (!pwd) {
      lengthError.textContent = "Failed to generate passphrase.";
      crackTimeContainer.style.display = "none";
      return;
    }
    
    const wordListSize = DICEWARE_WORDS.length;
    entropyBits = wordCount * Math.log2(wordListSize);
    
    if (capitalize) {
      entropyBits += Math.log2(wordCount);
    }
    
    if (addDigits) {
      entropyBits += Math.log2(100);
    }
    
  } else {
    // Strong mode
    const length = Number(lengthInput.value);
    if (length < 4 || length > 64) {
      lengthError.textContent = "Length must be 4–64.";
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

    pwd = generatePassword({ length, pool: charset.pool }, randomInt);
    entropyBits = calculateEntropyBits(length, charset.pool.length);
  }

  passwordInput.value = pwd;
  strengthLabelEl.textContent = entropyBits < 45 ? "Weak" : entropyBits < 70 ? "Medium" : "Strong";
  strengthBarEl.style.background = entropyBits < 45 ? "red" : entropyBits < 70 ? "orange" : "green";

  updateCrackTimeUI(entropyBits, elements);
}

/**
 * Handle user ID generation
 */
export function handleGenerateUserIds(elements) {
  const {
    uidError,
    uidResults,
    uidMode,
    uidSyllables,
    uidAddDigits,
    uidDigitsCount,
    uidAddSuffix,
    uidSuffix,
    uidMaxLength,
    uidWordsCount,
    uidWordsSeparator,
    uidWordsAddDigits,
    uidWordsDigitsCount,
    uidWordsMaxLength,
    uidCount
  } = elements;
  
  uidError.textContent = "";
  uidResults.innerHTML = "";

  const mode = uidMode.value;
  
  if (mode === "words") {
    if (!wordsLoaded) {
      uidError.textContent = "Word lists not loaded. Please refresh the page.";
      return;
    }
    if (WORD_ADJECTIVES.length === 0 || WORD_NOUNS.length === 0) {
      uidError.textContent = "Word lists are empty.";
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
      }, randomInt);
    } else {
      id = generateWordsId({
        wordsCount: Number(uidWordsCount.value),
        separator: uidWordsSeparator.value,
        addDigits: uidWordsAddDigits.checked,
        digitsCount: Number(uidWordsDigitsCount.value),
        maxLength: Number(uidWordsMaxLength.value)
      }, WORD_ADJECTIVES, WORD_NOUNS, randomInt);
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
    btn.addEventListener("click", async () => {
      const success = await copyToClipboard(id);
      if (success) {
        // Show toast via UI module
        const toast = document.getElementById("toast");
        if (toast) {
          toast.textContent = "Copied!";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 2000);
        }
      }
    });

    row.appendChild(span);
    row.appendChild(btn);
    uidResults.appendChild(row);
  });
}

/**
 * Get current password settings from UI
 */
export function getPasswordSettings(elements) {
  return {
    passwordMode: elements.passwordMode.value,
    length: elements.lengthInput.value,
    lowercase: elements.lowercaseCheckbox.checked,
    uppercase: elements.uppercaseCheckbox.checked,
    digits: elements.digitsCheckbox.checked,
    symbols: elements.symbolsCheckbox.checked,
    customSymbols: elements.customSymbolsInput.value,
    icloudPreset: elements.icloudPresetCheckbox.checked,
    easyWriteLength: elements.easyWriteLength.value,
    easySaySyllables: elements.easySaySyllables.value,
    easySayAddDigit: elements.easySayAddDigit.checked,
    passphraseWordCount: elements.passphraseWordCount.value,
    passphraseSeparator: elements.passphraseSeparator.value,
    passphraseCapitalize: elements.passphraseCapitalize.checked,
    passphraseAddDigits: elements.passphraseAddDigits.checked
  };
}

/**
 * Get current user ID settings from UI
 */
export function getUserIdSettings(elements) {
  return {
    mode: elements.uidMode.value,
    syllables: elements.uidSyllables.value,
    addDigits: elements.uidAddDigits.checked,
    digitsCount: elements.uidDigitsCount.value,
    addSuffix: elements.uidAddSuffix.checked,
    suffix: elements.uidSuffix.value,
    maxLength: elements.uidMaxLength.value,
    wordsCount: elements.uidWordsCount.value,
    separator: elements.uidWordsSeparator.value,
    wordsAddDigits: elements.uidWordsAddDigits.checked,
    wordsDigitsCount: elements.uidWordsDigitsCount.value,
    wordsMaxLength: elements.uidWordsMaxLength.value,
    count: elements.uidCount.value
  };
}

/**
 * Handle share button click
 */
export async function handleSharePassword(elements) {
  const settings = getPasswordSettings(elements);
  const url = buildPasswordShareUrl(settings, elements.crackHardwareSelect);
  const success = await copyShareUrl(url);
  if (success) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Share link copied!";
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
    }
  }
}

/**
 * Handle user ID share button click
 */
export async function handleShareUserId(elements) {
  const settings = getUserIdSettings(elements);
  const url = buildUserIdShareUrl(settings);
  const success = await copyShareUrl(url);
  if (success) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Share link copied!";
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
    }
  }
}
