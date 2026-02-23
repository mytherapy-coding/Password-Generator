/**
 * Type definitions for web app
 */

export interface AppElements {
  // Password mode controls
  passwordMode?: HTMLSelectElement;
  lengthInput?: HTMLInputElement;
  lowercaseCheckbox?: HTMLInputElement;
  uppercaseCheckbox?: HTMLInputElement;
  digitsCheckbox?: HTMLInputElement;
  symbolsCheckbox?: HTMLInputElement;
  customSymbolsInput?: HTMLInputElement;
  
  // Mode-specific controls
  strongModeControls?: HTMLElement;
  easyWriteModeControls?: HTMLElement;
  easyWriteLength?: HTMLInputElement;
  easySayModeControls?: HTMLElement;
  easySaySyllables?: HTMLSelectElement;
  easySayAddDigit?: HTMLInputElement;
  passphraseModeControls?: HTMLElement;
  passphraseWordCount?: HTMLSelectElement;
  passphraseSeparator?: HTMLSelectElement;
  passphraseCapitalize?: HTMLInputElement;
  passphraseAddDigits?: HTMLInputElement;
  
  // Password output
  passwordInput?: HTMLInputElement;
  strengthLabelEl?: HTMLElement;
  strengthBarEl?: HTMLElement;
  lengthError?: HTMLElement;
  symbolError?: HTMLElement;
  copyError?: HTMLElement;
  
  // Buttons
  generateBtn?: HTMLButtonElement;
  clearBtn?: HTMLButtonElement;
  copyBtn?: HTMLButtonElement;
  shareBtn?: HTMLButtonElement;
  
  // Crack time
  crackTimeContainer?: HTMLElement;
  crackHardwareSelect?: HTMLSelectElement;
  crackTimeValue?: HTMLElement;
  crackTimeWarning?: HTMLElement;
  
  // User ID controls
  uidMode?: HTMLSelectElement;
  uidCvcControls?: HTMLElement;
  uidWordsControls?: HTMLElement;
  uidSyllables?: HTMLSelectElement;
  uidAddDigits?: HTMLInputElement;
  uidDigitsCount?: HTMLInputElement;
  uidAddSuffix?: HTMLInputElement;
  uidSuffix?: HTMLInputElement;
  uidMaxLength?: HTMLInputElement;
  uidWordsCount?: HTMLSelectElement;
  uidWordsSeparator?: HTMLSelectElement;
  uidWordsAddDigits?: HTMLInputElement;
  uidWordsDigitsCount?: HTMLInputElement;
  uidWordsMaxLength?: HTMLInputElement;
  uidCount?: HTMLInputElement;
  uidGenerateBtn?: HTMLButtonElement;
  uidShareBtn?: HTMLButtonElement;
  resetUserIdSettingsBtn?: HTMLButtonElement;
  uidError?: HTMLElement;
  uidResults?: HTMLElement;
}

export interface WordLists {
  loaded: boolean;
  adjectives: string[];
  nouns: string[];
  diceware: string[];
}
