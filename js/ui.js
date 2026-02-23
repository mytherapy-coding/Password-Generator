/**
 * UI updates: toasts, enable/disable controls, crack-time display
 */

import { estimateCrackTimeSeconds, formatCrackTime, CRACK_HARDWARE_PROFILES } from "../core/index.js";

/**
 * Show toast notification
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
 * Update password mode UI (show/hide controls)
 */
export function updatePasswordModeUI(elements) {
  const mode = elements.passwordMode.value;
  
  // Hide all mode-specific controls
  if (elements.strongModeControls) elements.strongModeControls.classList.remove("visible");
  if (elements.easyWriteModeControls) elements.easyWriteModeControls.classList.remove("visible");
  if (elements.easySayModeControls) elements.easySayModeControls.classList.remove("visible");
  if (elements.passphraseModeControls) elements.passphraseModeControls.classList.remove("visible");
  
  // Show relevant controls
  if (mode === "strong" && elements.strongModeControls) {
    elements.strongModeControls.classList.add("visible");
  } else if (mode === "easyWrite" && elements.easyWriteModeControls) {
    elements.easyWriteModeControls.classList.add("visible");
  } else if (mode === "easySay" && elements.easySayModeControls) {
    elements.easySayModeControls.classList.add("visible");
  } else if (mode === "passphrase" && elements.passphraseModeControls) {
    elements.passphraseModeControls.classList.add("visible");
  }
  
  // Disable/enable controls based on mode
  const isIcloud = mode === "icloud";
  if (elements.lengthInput) elements.lengthInput.disabled = isIcloud;
  if (elements.lowercaseCheckbox) elements.lowercaseCheckbox.disabled = isIcloud;
  if (elements.uppercaseCheckbox) elements.uppercaseCheckbox.disabled = isIcloud;
  if (elements.digitsCheckbox) elements.digitsCheckbox.disabled = isIcloud;
  if (elements.symbolsCheckbox) elements.symbolsCheckbox.disabled = isIcloud;
  if (elements.customSymbolsInput) elements.customSymbolsInput.disabled = isIcloud;
  if (elements.easyWriteLength) elements.easyWriteLength.disabled = isIcloud;
  if (elements.easySaySyllables) elements.easySaySyllables.disabled = isIcloud;
  if (elements.easySayAddDigit) elements.easySayAddDigit.disabled = isIcloud;
  if (elements.passphraseWordCount) elements.passphraseWordCount.disabled = isIcloud;
  if (elements.passphraseSeparator) elements.passphraseSeparator.disabled = isIcloud;
  if (elements.passphraseCapitalize) elements.passphraseCapitalize.disabled = isIcloud;
  if (elements.passphraseAddDigits) elements.passphraseAddDigits.disabled = isIcloud;
}

/**
 * Update user ID mode UI (show/hide controls)
 */
export function updateUserIdModeUI(elements) {
  const mode = elements.uidMode.value;
  if (elements.uidCvcControls) {
    elements.uidCvcControls.classList.toggle("visible", mode === "cvc");
  }
  if (elements.uidWordsControls) {
    elements.uidWordsControls.classList.toggle("visible", mode === "words");
  }
}

/**
 * Update crack-time UI display
 */
export function updateCrackTimeUI(entropyBits, elements) {
  if (!Number.isFinite(entropyBits) || entropyBits <= 0) {
    if (elements.crackTimeContainer) {
      elements.crackTimeContainer.style.display = "none";
    }
    return;
  }

  const profileKey = elements.crackHardwareSelect?.value || "cpu";
  const guessesPerSecond = CRACK_HARDWARE_PROFILES[profileKey] || CRACK_HARDWARE_PROFILES.cpu;

  const seconds = estimateCrackTimeSeconds(entropyBits, guessesPerSecond);
  const formatted = formatCrackTime(seconds);

  if (elements.crackTimeContainer) {
    elements.crackTimeContainer.style.display = "";
  }
  if (elements.crackTimeValue) {
    elements.crackTimeValue.textContent = formatted === "< 1 second" ? formatted : `≈ ${formatted}`;
  }

  // Show warning if entropy < 20 bits
  if (elements.crackTimeWarning) {
    if (entropyBits < 20) {
      elements.crackTimeWarning.textContent = "This password is extremely weak and can be cracked almost instantly.";
      elements.crackTimeWarning.style.display = "";
    } else {
      elements.crackTimeWarning.style.display = "none";
      elements.crackTimeWarning.textContent = "";
    }
  }
}

/**
 * Update strength label and bar
 */
export function updateStrengthUI(entropyBits, elements) {
  if (!elements.strengthLabelEl || !elements.strengthBarEl) return;
  
  if (!Number.isFinite(entropyBits) || entropyBits <= 0) {
    elements.strengthLabelEl.textContent = "";
    elements.strengthBarEl.style.background = "gray";
    return;
  }
  
  if (entropyBits < 45) {
    elements.strengthLabelEl.textContent = "Weak";
    elements.strengthBarEl.style.background = "red";
  } else if (entropyBits < 70) {
    elements.strengthLabelEl.textContent = "Medium";
    elements.strengthBarEl.style.background = "orange";
  } else {
    elements.strengthLabelEl.textContent = "Strong";
    elements.strengthBarEl.style.background = "green";
  }
}

/**
 * Clear password input and related UI
 */
export function clearPasswordUI(elements) {
  if (elements.passwordInput) elements.passwordInput.value = "";
  if (elements.strengthLabelEl) elements.strengthLabelEl.textContent = "";
  if (elements.strengthBarEl) elements.strengthBarEl.style.background = "gray";
  if (elements.copyError) elements.copyError.textContent = "";
  if (elements.crackTimeContainer) elements.crackTimeContainer.style.display = "none";
}
