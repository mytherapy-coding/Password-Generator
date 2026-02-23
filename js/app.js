/**
 * Main application logic: password and user ID generation handlers
 */

import { randomInt } from "./random.js";
import {
  generatePassword,
  generateDicewarePassphrase,
  estimateCrackTime,
  generateIcloudPassword,
  generateEasyWritePassword,
  generateEasySayPassword,
  generateCvcId,
  generateWordsId,
  getCharset,
  validateSymbolsInput,
  calculateEntropyBits,
  UNAMBIGUOUS_LOWERCASE,
  UNAMBIGUOUS_UPPERCASE,
  UNAMBIGUOUS_DIGITS,
  SAFE_SYMBOLS,
  EASY_SAY_CONSONANTS,
  VOWELS
} from "../core/index.js";
import { updateCrackTimeUI, updateStrengthUI, clearPasswordUI } from "./ui.js";

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
 * Load word lists from JSON files
 */
export async function loadWordLists() {
  try {
    const [adjsRes, nounsRes, dicewareRes] = await Promise.all([
      fetch("./data/adjs.json"),
      fetch("./data/nouns.json"),
      fetch("./data/diceware_words.json")
    ]);

    if (!adjsRes.ok || !nounsRes.ok || !dicewareRes.ok) {
      throw new Error("Failed to load word lists");
    }

    const [adjs, nouns, diceware] = await Promise.all([
      adjsRes.json(),
      nounsRes.json(),
      dicewareRes.json()
    ]);

    // Normalize words (lowercase, remove non-alphanumeric)
    function normalizeWord(w) {
      return w.toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    const normalizedAdjs = adjs.map(normalizeWord).filter(Boolean);
    const normalizedNouns = nouns.map(normalizeWord).filter(Boolean);

    return {
      adjectives: normalizedAdjs,
      nouns: normalizedNouns,
      diceware: diceware,
      loaded: true
    };
  } catch (error) {
    console.error("Error loading word lists:", error);
    return {
      adjectives: [],
      nouns: [],
      diceware: [],
      loaded: false
    };
  }
}

/**
 * Handle password generation
 */
export function handleGeneratePassword(elements, wordLists, updateCrackTimeFromSettings) {
  if (elements.lengthError) elements.lengthError.textContent = "";
  if (elements.symbolError) elements.symbolError.textContent = "";
  if (elements.copyError) elements.copyError.textContent = "";
  if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";

  // iCloud mode
  if (elements.passwordMode.value === "icloud") {
    const result = generateIcloudPassword(randomInt);
    if (elements.passwordInput) elements.passwordInput.value = result.value;
    updateStrengthUI(result.entropy, elements);
    updateCrackTimeUI(result.entropy, elements);
    return;
  }

  const mode = elements.passwordMode.value;
  let result = null;

  if (mode === "easyWrite") {
    const length = Number(elements.easyWriteLength.value);
    if (length < 8 || length > 64) {
      if (elements.lengthError) {
        elements.lengthError.textContent = "Length must be 8–64 for Easy to write mode.";
      }
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }
    
    result = generateEasyWritePassword(length, randomInt);
    
  } else if (mode === "easySay") {
    const syllableCount = Number(elements.easySaySyllables.value);
    const addDigit = elements.easySayAddDigit.checked;
    
    result = generateEasySayPassword(syllableCount, addDigit, randomInt);
    
  } else if (mode === "passphrase") {
    const wordCount = Number(elements.passphraseWordCount.value);
    const separator = elements.passphraseSeparator.value;
    const capitalize = elements.passphraseCapitalize.checked;
    const addDigits = elements.passphraseAddDigits.checked;
    
    if (!wordLists.loaded || !wordLists.diceware || wordLists.diceware.length === 0) {
      if (elements.lengthError) {
        elements.lengthError.textContent = "Diceware word list not loaded. Please refresh the page.";
      }
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }
    
    try {
      result = generateDicewarePassphrase(
        { wordCount, separator, capitalize, addDigits },
        wordLists.diceware,
        randomInt
      );
    } catch (error) {
      if (elements.lengthError) {
        elements.lengthError.textContent = "Failed to generate passphrase.";
      }
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }
    
  } else {
    // Strong mode
    const length = Number(elements.lengthInput.value);
    if (length < 4 || length > 64) {
      if (elements.lengthError) {
        elements.lengthError.textContent = "Length must be 4–64.";
      }
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }

    let symbols = "";
    if (elements.symbolsCheckbox.checked) {
      if (!elements.customSymbolsInput.value.trim()) {
        symbols = SAFE_SYMBOLS;
      } else {
        const val = validateSymbolsInput(elements.customSymbolsInput.value);
        if (!val.ok) {
          if (elements.symbolError) elements.symbolError.textContent = val.msg;
          if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
          return;
        }
        symbols = val.symbols;
      }
    }

    const charset = getCharset({
      useLower: elements.lowercaseCheckbox.checked,
      useUpper: elements.uppercaseCheckbox.checked,
      useDigits: elements.digitsCheckbox.checked,
      useSymbols: elements.symbolsCheckbox.checked,
      symbols
    });

    if (!charset.ok) {
      if (elements.symbolError) elements.symbolError.textContent = charset.msg;
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }

    result = generatePassword({ length, charset: charset.pool }, randomInt);
  }

  if (result && elements.passwordInput) elements.passwordInput.value = result.value;
  if (result) {
    updateStrengthUI(result.entropy, elements);
    updateCrackTimeUI(result.entropy, elements);
  }
}

/**
 * Handle user ID generation
 */
export function handleGenerateUserIds(elements, wordLists) {
  if (elements.uidError) elements.uidError.textContent = "";
  if (elements.uidResults) elements.uidResults.innerHTML = "";

  const mode = elements.uidMode.value;
  
  if (mode === "words") {
    if (!wordLists.loaded || wordLists.adjectives.length === 0 || wordLists.nouns.length === 0) {
      if (elements.uidError) {
        elements.uidError.textContent = "Word lists not loaded. Please refresh the page.";
      }
      return;
    }
  }

  const count = Number(elements.uidCount.value);
  const results = [];
  const seen = new Set();
  let attempts = 0;
  const maxAttempts = count * 20;

  for (let i = 0; i < count; i++) {
    let id = null;
    
    for (let j = 0; j < 50; j++) {
      attempts++;
      if (attempts > maxAttempts) {
        if (elements.uidError) {
          elements.uidError.textContent = "Could not generate enough unique IDs. Try increasing max length or reducing count.";
        }
        return;
      }

      if (mode === "cvc") {
        id = generateCvcId({
          syllables: Number(elements.uidSyllables.value),
          addDigits: elements.uidAddDigits.checked,
          digitsCount: Number(elements.uidDigitsCount.value),
          addSuffix: elements.uidAddSuffix.checked,
          suffix: elements.uidSuffix.value,
          maxLength: Number(elements.uidMaxLength.value)
        }, randomInt);
      } else {
        id = generateWordsId({
          wordsCount: Number(elements.uidWordsCount.value),
          separator: elements.uidWordsSeparator.value,
          addDigits: elements.uidWordsAddDigits.checked,
          digitsCount: Number(elements.uidWordsDigitsCount.value),
          maxLength: Number(elements.uidWordsMaxLength.value)
        }, wordLists.adjectives, wordLists.nouns, randomInt);
      }

      if (id && !seen.has(id)) {
        seen.add(id);
        results.push(id);
        break;
      }
      id = null;
    }

    if (!id) {
      if (elements.uidError) {
        elements.uidError.textContent = mode === "words" 
          ? "Could not generate valid IDs. Check max length or word list files."
          : "Could not generate valid IDs. Increase max length.";
      }
      return;
    }
  }

  // Display results
  if (elements.uidResults) {
    results.forEach((id) => {
      const row = document.createElement("div");
      row.className = "uid-row";

      const span = document.createElement("span");
      span.textContent = id;

      const btn = document.createElement("button");
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        const ok = await copyToClipboard(id);
        const prev = btn.textContent;
        btn.textContent = ok ? "Copied!" : "Copy failed";
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = prev;
          btn.disabled = false;
        }, 1500);
      });

      row.appendChild(span);
      row.appendChild(btn);
      elements.uidResults.appendChild(row);
    });
  }
}

/**
 * Update crack time from current settings (live update)
 */
export function updateCrackTimeFromSettings(elements, wordLists) {
  // Only update if there's already a password
  if (!elements.passwordInput?.value) {
    if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
    return;
  }

  // iCloud mode: fixed entropy
  if (elements.passwordMode.value === "icloud") {
    const entropyBits = 18 * Math.log2(26) + 1 * Math.log2(10);
    updateCrackTimeUI(entropyBits, elements);
    return;
  }

  const mode = elements.passwordMode.value;
  let entropyBits = 0;

  if (mode === "easyWrite") {
    const length = Number(elements.easyWriteLength.value);
    if (length < 8 || length > 64) {
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }
    const poolSize = UNAMBIGUOUS_LOWERCASE.length + UNAMBIGUOUS_UPPERCASE.length + 
                     UNAMBIGUOUS_DIGITS.length + SAFE_SYMBOLS.length;
    entropyBits = calculateEntropyBits(length, poolSize);
    
  } else if (mode === "easySay") {
    const syllableCount = Number(elements.easySaySyllables.value);
    const addDigit = elements.easySayAddDigit.checked;
    const syllableEntropy = Math.log2(EASY_SAY_CONSONANTS.length) + 
                           Math.log2(VOWELS.length) + 
                           Math.log2(EASY_SAY_CONSONANTS.length);
    entropyBits = syllableCount * syllableEntropy;
    if (addDigit) {
      entropyBits += Math.log2(UNAMBIGUOUS_DIGITS.length);
    }
    
  } else if (mode === "passphrase") {
    const wordCount = Number(elements.passphraseWordCount.value);
    if (wordCount < 4 || wordCount > 8) {
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }
    
    if (!wordLists.loaded || !wordLists.diceware || wordLists.diceware.length === 0) {
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }
    
    const capitalize = elements.passphraseCapitalize.checked;
    const addDigits = elements.passphraseAddDigits.checked;
    
    const wordListSize = wordLists.diceware.length;
    entropyBits = wordCount * Math.log2(wordListSize);
    
    if (capitalize) {
      entropyBits += Math.log2(wordCount);
    }
    
    if (addDigits) {
      entropyBits += Math.log2(100);
    }
    
  } else {
    // Strong mode
    const length = Number(elements.lengthInput.value);
    if (length < 4 || length > 64) {
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }

    let symbols = "";
    if (elements.symbolsCheckbox.checked) {
      if (!elements.customSymbolsInput.value.trim()) {
        symbols = SAFE_SYMBOLS;
      } else {
        const val = validateSymbolsInput(elements.customSymbolsInput.value);
        if (!val.ok) {
          if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
          return;
        }
        symbols = val.symbols;
      }
    }

    const charset = getCharset({
      useLower: elements.lowercaseCheckbox.checked,
      useUpper: elements.uppercaseCheckbox.checked,
      useDigits: elements.digitsCheckbox.checked,
      useSymbols: elements.symbolsCheckbox.checked,
      symbols
    });

    if (!charset.ok) {
      if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
      return;
    }

    entropyBits = calculateEntropyBits(length, charset.pool.length);
  }

  updateCrackTimeUI(entropyBits, elements);
}
