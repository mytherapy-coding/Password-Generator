/**
 * UI state management and utilities
 */

import { CRACK_HARDWARE_PROFILES, estimateCrackTimeSeconds, formatCrackTime, calculateEntropyBits, validateSymbolsInput, getCharset } from "../core/index.js";

/**
 * Show toast notification
 * @param {string} message - Message to display
 */
export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.textContent = message;
  toast.style.display = "block";
  
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

/**
 * Update password mode UI (show/hide controls, enable/disable)
 */
export function updatePasswordModeUI(elements) {
  const mode = elements.passwordMode.value;
  const isIcloud = elements.icloudPresetCheckbox.checked;
  
  // Show/hide mode-specific controls
  elements.strongModeControls.style.display = (mode === "strong" && !isIcloud) ? "" : "none";
  elements.easyWriteModeControls.style.display = (mode === "easyWrite" && !isIcloud) ? "" : "none";
  elements.easySayModeControls.style.display = (mode === "easySay" && !isIcloud) ? "" : "none";
  elements.passphraseModeControls.style.display = (mode === "passphrase" && !isIcloud) ? "" : "none";
  
  // Disable all controls if iCloud preset is active
  if (isIcloud) {
    elements.lengthInput.disabled = true;
    elements.lowercaseCheckbox.disabled = true;
    elements.uppercaseCheckbox.disabled = true;
    elements.digitsCheckbox.disabled = true;
    elements.symbolsCheckbox.disabled = true;
    elements.customSymbolsInput.disabled = true;
    elements.easyWriteLength.disabled = true;
    elements.easySaySyllables.disabled = true;
    elements.easySayAddDigit.disabled = true;
    elements.passphraseWordCount.disabled = true;
    elements.passphraseSeparator.disabled = true;
    elements.passphraseCapitalize.disabled = true;
    elements.passphraseAddDigits.disabled = true;
    elements.passwordMode.disabled = true;
    elements.presetInfo.textContent = "iCloud preset is active.";
  } else {
    elements.lengthInput.disabled = false;
    elements.lowercaseCheckbox.disabled = false;
    elements.uppercaseCheckbox.disabled = false;
    elements.digitsCheckbox.disabled = false;
    elements.symbolsCheckbox.disabled = false;
    elements.customSymbolsInput.disabled = false;
    elements.easyWriteLength.disabled = false;
    elements.easySaySyllables.disabled = false;
    elements.easySayAddDigit.disabled = false;
    elements.passphraseWordCount.disabled = false;
    elements.passphraseSeparator.disabled = false;
    elements.passphraseCapitalize.disabled = false;
    elements.passphraseAddDigits.disabled = false;
    elements.passwordMode.disabled = false;
    elements.presetInfo.textContent = "";
  }
}

/**
 * Update user ID mode UI
 */
export function updateUserIdModeUI(elements) {
  const mode = elements.uidMode.value;
  elements.uidCvcControls.style.display = mode === "cvc" ? "" : "none";
  elements.uidWordsControls.style.display = mode === "words" ? "" : "none";
}

/**
 * Update crack time UI
 */
export function updateCrackTimeUI(entropyBits, elements) {
  if (!Number.isFinite(entropyBits) || entropyBits <= 0) {
    elements.crackTimeContainer.style.display = "none";
    return;
  }

  const profileKey = elements.crackHardwareSelect.value || "cpu";
  const guessesPerSecond = CRACK_HARDWARE_PROFILES[profileKey] || CRACK_HARDWARE_PROFILES.cpu;

  const seconds = estimateCrackTimeSeconds(entropyBits, guessesPerSecond);
  const formatted = formatCrackTime(seconds);

  elements.crackTimeContainer.style.display = "";
  elements.crackTimeValue.textContent = formatted === "< 1 second" ? formatted : `≈ ${formatted}`;

  // Show warning if entropy < 20 bits
  if (entropyBits < 20) {
    elements.crackTimeWarning.textContent = "This password is extremely weak and can be cracked almost instantly.";
    elements.crackTimeWarning.style.display = "";
  } else {
    elements.crackTimeWarning.style.display = "none";
    elements.crackTimeWarning.textContent = "";
  }

  try {
    localStorage.setItem("crackHardwareProfile", profileKey);
  } catch {
    // ignore
  }
}

/**
 * Update crack time based on current settings (live update)
 * Only updates if a password is already generated
 */
export function updateCrackTimeFromSettings(elements) {
  if (!elements.passwordInput.value) {
    elements.crackTimeContainer.style.display = "none";
    return;
  }

  // iCloud preset: fixed entropy
  if (elements.icloudPresetCheckbox.checked) {
    updateCrackTimeUI(71, elements);
    return;
  }

  const mode = elements.passwordMode.value;
  let entropyBits = 0;

  if (mode === "easyWrite") {
    const length = Number(elements.easyWriteLength.value);
    if (length < 8 || length > 64) {
      elements.crackTimeContainer.style.display = "none";
      return;
    }
    const poolSize = 22 + 22 + 6 + 4; // UNAMBIGUOUS_LOWERCASE + UNAMBIGUOUS_UPPERCASE + UNAMBIGUOUS_DIGITS + SAFE_SYMBOLS
    entropyBits = calculateEntropyBits(length, poolSize);
    
  } else if (mode === "easySay") {
    const syllableCount = Number(elements.easySaySyllables.value);
    const addDigit = elements.easySayAddDigit.checked;
    const syllableEntropy = Math.log2(21) + Math.log2(6) + Math.log2(21); // EASY_SAY_CONSONANTS + VOWELS + EASY_SAY_CONSONANTS
    entropyBits = syllableCount * syllableEntropy;
    if (addDigit) {
      entropyBits += Math.log2(6); // UNAMBIGUOUS_DIGITS
    }
    
  } else if (mode === "passphrase") {
    const wordCount = Number(elements.passphraseWordCount.value);
    if (wordCount < 4 || wordCount > 8) {
      elements.crackTimeContainer.style.display = "none";
      return;
    }
    
    // Check if wordlist is available (would need to be passed or accessed)
    // For now, assume it's loaded
    const capitalize = elements.passphraseCapitalize.checked;
    const addDigits = elements.passphraseAddDigits.checked;
    
    // Assuming 7776 words in EFF Long Wordlist
    const wordListSize = 7776;
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
      elements.crackTimeContainer.style.display = "none";
      return;
    }

    let symbols = "";
    if (elements.symbolsCheckbox.checked) {
      if (!elements.customSymbolsInput.value.trim()) {
        symbols = "-_!@#";
      } else {
        const val = validateSymbolsInput(elements.customSymbolsInput.value);
        if (!val.ok) {
          elements.crackTimeContainer.style.display = "none";
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
      elements.crackTimeContainer.style.display = "none";
      return;
    }

    entropyBits = calculateEntropyBits(length, charset.pool.length);
  }

  updateCrackTimeUI(entropyBits, elements);
}
