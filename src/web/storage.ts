/**
 * localStorage save/restore operations
 */

import type { AppElements } from "./types.js";

const LOCAL_STORAGE_CRACK_KEY = "crackHardwareProfile";

/**
 * Save password generator settings to localStorage
 */
export function savePasswordSettings(elements: AppElements): void {
  const settings = {
    passwordMode: elements.passwordMode?.value ?? "strong",
    length: elements.lengthInput?.value ?? "12",
    lowercase: elements.lowercaseCheckbox?.checked ?? true,
    uppercase: elements.uppercaseCheckbox?.checked ?? true,
    digits: elements.digitsCheckbox?.checked ?? true,
    symbols: elements.symbolsCheckbox?.checked ?? false,
    customSymbols: elements.customSymbolsInput?.value ?? "",
    easyWriteLength: elements.easyWriteLength?.value ?? "16",
    easySaySyllables: elements.easySaySyllables?.value ?? "5",
    easySayAddDigit: elements.easySayAddDigit?.checked ?? true,
    passphraseWordCount: elements.passphraseWordCount?.value ?? "6",
    passphraseSeparator: elements.passphraseSeparator?.value ?? " ",
    passphraseCapitalize: elements.passphraseCapitalize?.checked ?? false,
    passphraseAddDigits: elements.passphraseAddDigits?.checked ?? false
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
export function restorePasswordSettings(elements: AppElements): void {
  const raw = localStorage.getItem("passwordSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw) as Record<string, unknown>;
    if (elements.passwordMode) elements.passwordMode.value = (s.passwordMode as string) ?? "strong";
    if (elements.lengthInput) elements.lengthInput.value = (s.length as string) ?? "12";
    if (elements.lowercaseCheckbox) elements.lowercaseCheckbox.checked = (s.lowercase as boolean) ?? true;
    if (elements.uppercaseCheckbox) elements.uppercaseCheckbox.checked = (s.uppercase as boolean) ?? true;
    if (elements.digitsCheckbox) elements.digitsCheckbox.checked = (s.digits as boolean) ?? true;
    if (elements.symbolsCheckbox) elements.symbolsCheckbox.checked = (s.symbols as boolean) ?? false;
    if (elements.customSymbolsInput) elements.customSymbolsInput.value = (s.customSymbols as string) ?? "";
    if (elements.easyWriteLength) elements.easyWriteLength.value = (s.easyWriteLength as string) ?? "16";
    if (elements.easySaySyllables) elements.easySaySyllables.value = (s.easySaySyllables as string) ?? "5";
    if (elements.easySayAddDigit) elements.easySayAddDigit.checked = (s.easySayAddDigit as boolean) ?? true;
    if (elements.passphraseWordCount) elements.passphraseWordCount.value = (s.passphraseWordCount as string) ?? "6";
    if (elements.passphraseSeparator) elements.passphraseSeparator.value = (s.passphraseSeparator as string) ?? " ";
    if (elements.passphraseCapitalize) elements.passphraseCapitalize.checked = (s.passphraseCapitalize as boolean) ?? false;
    if (elements.passphraseAddDigits) elements.passphraseAddDigits.checked = (s.passphraseAddDigits as boolean) ?? false;
  } catch {
    // ignore
  }
}

/**
 * Save user ID generator settings to localStorage
 */
export function saveUserIdSettings(elements: AppElements): void {
  const settings = {
    mode: elements.uidMode?.value ?? "cvc",
    syllables: elements.uidSyllables?.value ?? "2",
    addDigits: elements.uidAddDigits?.checked ?? true,
    digitsCount: elements.uidDigitsCount?.value ?? "2",
    addSuffix: elements.uidAddSuffix?.checked ?? true,
    suffix: elements.uidSuffix?.value ?? "dev",
    maxLength: elements.uidMaxLength?.value ?? "15",
    wordsCount: elements.uidWordsCount?.value ?? "2",
    separator: elements.uidWordsSeparator?.value ?? "_",
    wordsAddDigits: elements.uidWordsAddDigits?.checked ?? false,
    wordsDigitsCount: elements.uidWordsDigitsCount?.value ?? "2",
    wordsMaxLength: elements.uidWordsMaxLength?.value ?? "20",
    count: elements.uidCount?.value ?? "10"
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
export function restoreUserIdSettings(elements: AppElements, updateUserIdModeUI: () => void): void {
  const raw = localStorage.getItem("userIdSettings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw) as Record<string, unknown>;
    if (elements.uidMode) elements.uidMode.value = (s.mode as string) ?? "cvc";
    if (elements.uidSyllables) elements.uidSyllables.value = (s.syllables as string) ?? "2";
    if (elements.uidAddDigits) elements.uidAddDigits.checked = (s.addDigits as boolean) ?? true;
    if (elements.uidDigitsCount) elements.uidDigitsCount.value = (s.digitsCount as string) ?? "2";
    if (elements.uidAddSuffix) elements.uidAddSuffix.checked = (s.addSuffix as boolean) ?? true;
    if (elements.uidSuffix) elements.uidSuffix.value = (s.suffix as string) ?? "dev";
    if (elements.uidMaxLength) elements.uidMaxLength.value = (s.maxLength as string) ?? "15";
    if (elements.uidWordsCount) elements.uidWordsCount.value = (s.wordsCount as string) ?? "2";
    if (elements.uidWordsSeparator) elements.uidWordsSeparator.value = (s.separator as string) ?? "_";
    if (elements.uidWordsAddDigits) elements.uidWordsAddDigits.checked = (s.wordsAddDigits as boolean) ?? false;
    if (elements.uidWordsDigitsCount) elements.uidWordsDigitsCount.value = (s.wordsDigitsCount as string) ?? "2";
    if (elements.uidWordsMaxLength) elements.uidWordsMaxLength.value = (s.wordsMaxLength as string) ?? "20";
    if (elements.uidCount) elements.uidCount.value = (s.count as string) ?? "10";
    updateUserIdModeUI();
  } catch {
    // ignore
  }
}

/**
 * Save crack hardware profile selection
 */
export function saveCrackHardwareProfile(profile: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, profile);
  } catch {
    // ignore
  }
}

/**
 * Restore crack hardware profile selection
 */
export function restoreCrackHardwareSelection(elements: AppElements, CRACK_HARDWARE_PROFILES: Record<string, number>): void {
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
export function saveActiveTab(tabId: string): void {
  try {
    localStorage.setItem("activeTab", tabId);
  } catch {
    // ignore
  }
}

/**
 * Restore active tab
 */
export function restoreActiveTab(): void {
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
