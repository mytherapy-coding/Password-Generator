/**
 * localStorage save/restore operations
 */

const LOCAL_STORAGE_CRACK_KEY = "crackHardwareProfile";

/**
 * Save password generator settings to localStorage
 */
export function savePasswordSettings(elements) {
  const settings = {
    passwordMode: elements.passwordMode.value,
    length: elements.lengthInput.value,
    lowercase: elements.lowercaseCheckbox.checked,
    uppercase: elements.uppercaseCheckbox.checked,
    digits: elements.digitsCheckbox.checked,
    symbols: elements.symbolsCheckbox.checked,
    customSymbols: elements.customSymbolsInput.value,
    easyWriteLength: elements.easyWriteLength.value,
    easySaySyllables: elements.easySaySyllables.value,
    easySayAddDigit: elements.easySayAddDigit.checked,
    passphraseWordCount: elements.passphraseWordCount.value,
    passphraseSeparator: elements.passphraseSeparator.value,
    passphraseCapitalize: elements.passphraseCapitalize.checked,
    passphraseAddDigits: elements.passphraseAddDigits.checked
  };
  try {
    localStorage.setItem("passwordSettings", JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Restore password generator settings from localStorage
 */
export function restorePasswordSettings(elements) {
  const raw = localStorage.getItem("passwordSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (elements.passwordMode) elements.passwordMode.value = s.passwordMode ?? "strong";
    if (elements.lengthInput) elements.lengthInput.value = s.length ?? "12";
    if (elements.lowercaseCheckbox) elements.lowercaseCheckbox.checked = s.lowercase ?? true;
    if (elements.uppercaseCheckbox) elements.uppercaseCheckbox.checked = s.uppercase ?? true;
    if (elements.digitsCheckbox) elements.digitsCheckbox.checked = s.digits ?? true;
    if (elements.symbolsCheckbox) elements.symbolsCheckbox.checked = s.symbols ?? false;
    if (elements.customSymbolsInput) elements.customSymbolsInput.value = s.customSymbols ?? "";
    if (elements.easyWriteLength) elements.easyWriteLength.value = s.easyWriteLength ?? "16";
    if (elements.easySaySyllables) elements.easySaySyllables.value = s.easySaySyllables ?? "5";
    if (elements.easySayAddDigit) elements.easySayAddDigit.checked = s.easySayAddDigit ?? true;
    if (elements.passphraseWordCount) elements.passphraseWordCount.value = s.passphraseWordCount ?? "6";
    if (elements.passphraseSeparator) elements.passphraseSeparator.value = s.passphraseSeparator ?? " ";
    if (elements.passphraseCapitalize) elements.passphraseCapitalize.checked = s.passphraseCapitalize ?? false;
    if (elements.passphraseAddDigits) elements.passphraseAddDigits.checked = s.passphraseAddDigits ?? false;
  } catch {
    // ignore
  }
}

/**
 * Save user ID generator settings to localStorage
 */
export function saveUserIdSettings(elements) {
  const settings = {
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
  try {
    localStorage.setItem("userIdSettings", JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Restore user ID generator settings from localStorage
 */
export function restoreUserIdSettings(elements, updateUserIdModeUI) {
  const raw = localStorage.getItem("userIdSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (elements.uidMode) elements.uidMode.value = s.mode ?? "cvc";
    if (elements.uidSyllables) elements.uidSyllables.value = s.syllables ?? "2";
    if (elements.uidAddDigits) elements.uidAddDigits.checked = s.addDigits ?? true;
    if (elements.uidDigitsCount) elements.uidDigitsCount.value = s.digitsCount ?? "2";
    if (elements.uidAddSuffix) elements.uidAddSuffix.checked = s.addSuffix ?? true;
    if (elements.uidSuffix) elements.uidSuffix.value = s.suffix ?? "dev";
    if (elements.uidMaxLength) elements.uidMaxLength.value = s.maxLength ?? "15";
    if (elements.uidWordsCount) elements.uidWordsCount.value = s.wordsCount ?? "2";
    if (elements.uidWordsSeparator) elements.uidWordsSeparator.value = s.separator ?? "_";
    if (elements.uidWordsAddDigits) elements.uidWordsAddDigits.checked = s.wordsAddDigits ?? false;
    if (elements.uidWordsDigitsCount) elements.uidWordsDigitsCount.value = s.wordsDigitsCount ?? "2";
    if (elements.uidWordsMaxLength) elements.uidWordsMaxLength.value = s.wordsMaxLength ?? "20";
    if (elements.uidCount) elements.uidCount.value = s.count ?? "10";
    if (updateUserIdModeUI) updateUserIdModeUI();
  } catch {
    // ignore
  }
}

/**
 * Save crack hardware profile selection
 */
export function saveCrackHardwareProfile(profile) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, profile);
  } catch {
    // ignore
  }
}

/**
 * Restore crack hardware profile selection
 */
export function restoreCrackHardwareSelection(elements, CRACK_HARDWARE_PROFILES) {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CRACK_KEY);
    if (saved && CRACK_HARDWARE_PROFILES[saved] && elements.crackHardwareSelect) {
      elements.crackHardwareSelect.value = saved;
    }
  } catch {
    // ignore
  }
}

/**
 * Save active tab
 */
export function saveActiveTab(tabId) {
  try {
    localStorage.setItem("activeTab", tabId);
  } catch {
    // ignore
  }
}

/**
 * Restore active tab
 */
export function restoreActiveTab() {
  try {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab === "userIdTab" || savedTab === "passwordTab") {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      const tabEl = document.querySelector(`[data-tab="${savedTab}"]`);
      const contentEl = document.getElementById(savedTab);
      if (tabEl) tabEl.classList.add("active");
      if (contentEl) contentEl.classList.add("active");
    }
  } catch {
    // ignore
  }
}
