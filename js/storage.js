/**
 * LocalStorage persistence for settings
 */

const LOCAL_STORAGE_PASSWORD_KEY = "passwordSettings";
const LOCAL_STORAGE_USERID_KEY = "userIdSettings";
const LOCAL_STORAGE_CRACK_KEY = "crackHardwareProfile";

/**
 * Save password settings to localStorage
 */
export function savePasswordSettings(settings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PASSWORD_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed to save password settings:", err);
  }
}

/**
 * Restore password settings from localStorage
 */
export function restorePasswordSettings(elements) {
  const raw = localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    elements.passwordMode.value = s.passwordMode ?? "strong";
    elements.lengthInput.value = s.length ?? "12";
    elements.lowercaseCheckbox.checked = s.lowercase ?? true;
    elements.uppercaseCheckbox.checked = s.uppercase ?? true;
    elements.digitsCheckbox.checked = s.digits ?? true;
    elements.symbolsCheckbox.checked = s.symbols ?? false;
    elements.customSymbolsInput.value = s.customSymbols ?? "";
    elements.icloudPresetCheckbox.checked = s.icloudPreset ?? false;
    elements.easyWriteLength.value = s.easyWriteLength ?? "16";
    elements.easySaySyllables.value = s.easySaySyllables ?? "5";
    elements.easySayAddDigit.checked = s.easySayAddDigit ?? true;
    elements.passphraseWordCount.value = s.passphraseWordCount ?? "6";
    elements.passphraseSeparator.value = s.passphraseSeparator ?? " ";
    elements.passphraseCapitalize.checked = s.passphraseCapitalize ?? false;
    elements.passphraseAddDigits.checked = s.passphraseAddDigits ?? false;
  } catch (err) {
    console.warn("Failed to restore password settings:", err);
  }
}

/**
 * Save user ID settings to localStorage
 */
export function saveUserIdSettings(settings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERID_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed to save user ID settings:", err);
  }
}

/**
 * Restore user ID settings from localStorage
 */
export function restoreUserIdSettings(elements) {
  const raw = localStorage.getItem(LOCAL_STORAGE_USERID_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    elements.uidMode.value = s.mode ?? "cvc";
    elements.uidSyllables.value = s.syllables ?? "2";
    elements.uidAddDigits.checked = s.addDigits ?? true;
    elements.uidDigitsCount.value = s.digitsCount ?? "2";
    elements.uidAddSuffix.checked = s.addSuffix ?? true;
    elements.uidSuffix.value = s.suffix ?? "dev";
    elements.uidMaxLength.value = s.maxLength ?? "15";
    elements.uidWordsCount.value = s.wordsCount ?? "2";
    elements.uidWordsSeparator.value = s.separator ?? "_";
    elements.uidWordsAddDigits.checked = s.wordsAddDigits ?? false;
    elements.uidWordsDigitsCount.value = s.wordsDigitsCount ?? "2";
    elements.uidWordsMaxLength.value = s.wordsMaxLength ?? "20";
    elements.uidCount.value = s.count ?? "10";
  } catch (err) {
    console.warn("Failed to restore user ID settings:", err);
  }
}

/**
 * Save crack hardware profile to localStorage
 */
export function saveCrackHardware(hardware) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CRACK_KEY, hardware);
  } catch (err) {
    console.warn("Failed to save crack hardware:", err);
  }
}

/**
 * Restore crack hardware profile from localStorage
 */
export function restoreCrackHardware(elements) {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CRACK_KEY);
    if (saved && elements.crackHardwareSelect) {
      elements.crackHardwareSelect.value = saved;
    }
  } catch (err) {
    console.warn("Failed to restore crack hardware:", err);
  }
}
