/**
 * Type definitions for web app
 */

export interface AppElements {
  // Password mode controls
  passwordMode?: HTMLSelectElement | null;
  lengthInput?: HTMLInputElement | null;
  lowercaseCheckbox?: HTMLInputElement | null;
  uppercaseCheckbox?: HTMLInputElement | null;
  digitsCheckbox?: HTMLInputElement | null;
  symbolsCheckbox?: HTMLInputElement | null;
  customSymbolsInput?: HTMLInputElement | null;
  
  // Mode-specific controls
  strongModeControls?: HTMLElement | null;
  easyWriteModeControls?: HTMLElement | null;
  easyWriteLength?: HTMLInputElement | null;
  easySayModeControls?: HTMLElement | null;
  easySaySyllables?: HTMLSelectElement | null;
  easySayAddDigit?: HTMLInputElement | null;
  passphraseModeControls?: HTMLElement | null;
  passphraseWordCount?: HTMLSelectElement | null;
  passphraseSeparator?: HTMLSelectElement | null;
  passphraseCapitalize?: HTMLInputElement | null;
  passphraseAddDigits?: HTMLInputElement | null;
  
  // Password output
  passwordInput?: HTMLInputElement | null;
  strengthLabelEl?: HTMLElement | null;
  strengthBarEl?: HTMLElement | null;
  lengthError?: HTMLElement | null;
  symbolError?: HTMLElement | null;
  copyError?: HTMLElement | null;
  
  // Buttons
  generateBtn?: HTMLButtonElement | null;
  resetPasswordSettingsBtn?: HTMLButtonElement | null;
  copyBtn?: HTMLButtonElement | null;
  shareBtn?: HTMLButtonElement | null;
  
  // Crack time
  crackTimeContainer?: HTMLElement | null;
  crackHardwareSelect?: HTMLSelectElement | null;
  crackTimeValue?: HTMLElement | null;
  crackTimeWarning?: HTMLElement | null;
  
  // User ID controls
  uidMode?: HTMLSelectElement | null;
  uidCvcControls?: HTMLElement | null;
  uidWordsControls?: HTMLElement | null;
  uidSyllables?: HTMLSelectElement | null;
  uidAddDigits?: HTMLInputElement | null;
  uidDigitsCount?: HTMLInputElement | null;
  uidAddSuffix?: HTMLInputElement | null;
  uidSuffix?: HTMLInputElement | null;
  uidMaxLength?: HTMLInputElement | null;
  uidWordsCount?: HTMLSelectElement | null;
  uidWordsSeparator?: HTMLSelectElement | null;
  uidWordsAddDigits?: HTMLInputElement | null;
  uidWordsDigitsCount?: HTMLInputElement | null;
  uidWordsMaxLength?: HTMLInputElement | null;
  uidCount?: HTMLInputElement | null;
  uidGenerateBtn?: HTMLButtonElement | null;
  uidShareBtn?: HTMLButtonElement | null;
  resetUserIdSettingsBtn?: HTMLButtonElement | null;
  uidError?: HTMLElement | null;
  uidResults?: HTMLElement | null;
}

export interface WordLists {
  loaded: boolean;
  adjectives: string[];
  nouns: string[];
  diceware: string[];
}
