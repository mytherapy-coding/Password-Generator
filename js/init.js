/**
 * Application initialization
 * Entry point for the web app
 */

import { loadWordLists, handleGeneratePassword, handleGenerateUserIds, copyToClipboard, getPasswordSettings, getUserIdSettings, handleSharePassword, handleShareUserId } from "./app.js";
import { updatePasswordModeUI, updateUserIdModeUI, updateCrackTimeUI, updateCrackTimeFromSettings, showToast } from "./ui.js";
import { savePasswordSettings, restorePasswordSettings, saveUserIdSettings, restoreUserIdSettings, saveCrackHardware, restoreCrackHardware } from "./storage.js";
import { restoreSettingsFromURL, clearUrlParams, getBool, getInt } from "./share.js";
import { CRACK_HARDWARE_PROFILES } from "../core/index.js";

// DOM Elements (will be populated in init after DOM is ready)
let elements = {};

// Initialize
async function init() {
  // Populate elements object
  elements = {
    // Password mode
    passwordMode: document.getElementById("passwordMode"),
    icloudPresetCheckbox: document.getElementById("icloudPreset"),
    presetInfo: document.getElementById("presetInfo"),
    
    // Strong mode controls
    strongModeControls: document.getElementById("strongModeControls"),
    lengthInput: document.getElementById("length"),
    lowercaseCheckbox: document.getElementById("lowercase"),
    uppercaseCheckbox: document.getElementById("uppercase"),
    digitsCheckbox: document.getElementById("digits"),
    symbolsCheckbox: document.getElementById("symbols"),
    customSymbolsInput: document.getElementById("customSymbols"),
    
    // Easy write mode
    easyWriteModeControls: document.getElementById("easyWriteModeControls"),
    easyWriteLength: document.getElementById("easyWriteLength"),
    
    // Easy say mode
    easySayModeControls: document.getElementById("easySayModeControls"),
    easySaySyllables: document.getElementById("easySaySyllables"),
    easySayAddDigit: document.getElementById("easySayAddDigit"),
    
    // Passphrase mode
    passphraseModeControls: document.getElementById("passphraseModeControls"),
    passphraseWordCount: document.getElementById("passphraseWordCount"),
    passphraseSeparator: document.getElementById("passphraseSeparator"),
    passphraseCapitalize: document.getElementById("passphraseCapitalize"),
    passphraseAddDigits: document.getElementById("passphraseAddDigits"),
    
    // Password output
    passwordInput: document.getElementById("password"),
    strengthLabelEl: document.getElementById("strengthLabel"),
    strengthBarEl: document.getElementById("strengthBar"),
    
    // Errors
    lengthError: document.getElementById("lengthError"),
    symbolError: document.getElementById("symbolError"),
    copyError: document.getElementById("copyError"),
    
    // Crack time
    crackTimeContainer: document.getElementById("crackTimeContainer"),
    crackHardwareSelect: document.getElementById("crackHardware"),
    crackTimeValue: document.getElementById("crackTimeValue"),
    crackTimeWarning: document.getElementById("crackTimeWarning"),
    
    // User ID
    uidMode: document.getElementById("uidMode"),
    uidCvcControls: document.getElementById("uidCvcControls"),
    uidWordsControls: document.getElementById("uidWordsControls"),
    uidSyllables: document.getElementById("uidSyllables"),
    uidAddDigits: document.getElementById("uidAddDigits"),
    uidDigitsCount: document.getElementById("uidDigitsCount"),
    uidAddSuffix: document.getElementById("uidAddSuffix"),
    uidSuffix: document.getElementById("uidSuffix"),
    uidMaxLength: document.getElementById("uidMaxLength"),
    uidWordsCount: document.getElementById("uidWordsCount"),
    uidWordsSeparator: document.getElementById("uidWordsSeparator"),
    uidWordsAddDigits: document.getElementById("uidWordsAddDigits"),
    uidWordsDigitsCount: document.getElementById("uidWordsDigitsCount"),
    uidWordsMaxLength: document.getElementById("uidWordsMaxLength"),
    uidCount: document.getElementById("uidCount"),
    uidResults: document.getElementById("uidResults"),
    uidError: document.getElementById("uidError")
  };
  
  // Load word lists
  await loadWordLists();
  
  // Restore from URL or localStorage
  const urlParamsRestored = restoreSettingsFromURL(elements, getBool, getInt, CRACK_HARDWARE_PROFILES);
  
  // Update UI after restoring settings
  updatePasswordModeUI(elements);
  updateUserIdModeUI(elements);
  
  if (!urlParamsRestored) {
    // Restore from localStorage
    restorePasswordSettings(elements);
    restoreUserIdSettings(elements);
    restoreCrackHardware(elements);
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Clean URL after applying settings
  if (urlParamsRestored) {
    setTimeout(() => {
      clearUrlParams();
    }, 0);
    
    // Auto-generate if URL params had auto=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("auto") === "1") {
      setTimeout(() => {
        const gen = params.get("gen");
        if (gen === "pwd") {
          handleGeneratePassword(elements);
        } else if (gen === "uid") {
          handleGenerateUserIds(elements);
        }
      }, 100);
    }
  }
  
  // Recompute crack time after restoring settings (if password exists)
  setTimeout(() => {
    updateCrackTimeFromSettings(elements);
  }, 0);
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Password generation
  const generateBtn = document.getElementById("generate");
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      handleGeneratePassword(elements);
      savePasswordSettings(getPasswordSettings(elements));
    });
  }

  // Clear button
  const clearBtn = document.getElementById("clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      elements.passwordInput.value = "";
      elements.strengthLabelEl.textContent = "";
      elements.strengthBarEl.style.background = "";
      elements.crackTimeContainer.style.display = "none";
    });
  }

  // Copy button
  const copyBtn = document.getElementById("copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!elements.passwordInput.value) {
        elements.copyError.textContent = "No password to copy.";
        return;
      }
      const success = await copyToClipboard(elements.passwordInput.value);
      if (success) {
        showToast("Copied!");
        elements.copyError.textContent = "";
      } else {
        elements.copyError.textContent = "Failed to copy. Please copy manually.";
      }
    });
  }

  // Share button
  const shareBtn = document.getElementById("share");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      handleSharePassword(elements);
    });
  }

  // Password mode controls
  if (elements.passwordMode) {
    elements.passwordMode.addEventListener("change", () => {
      updatePasswordModeUI(elements);
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  if (elements.icloudPresetCheckbox) {
    elements.icloudPresetCheckbox.addEventListener("change", () => {
      updatePasswordModeUI(elements);
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  // Character type checkboxes
  [elements.lengthInput, elements.lowercaseCheckbox, elements.uppercaseCheckbox, 
   elements.digitsCheckbox, elements.symbolsCheckbox].forEach((el) => {
    if (el) {
      el.addEventListener("change", () => {
        savePasswordSettings(getPasswordSettings(elements));
        updateCrackTimeFromSettings(elements);
      });
    }
  });

  if (elements.customSymbolsInput) {
    elements.customSymbolsInput.addEventListener("input", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  // Easy mode controls
  if (elements.easyWriteLength) {
    elements.easyWriteLength.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  if (elements.easySaySyllables) {
    elements.easySaySyllables.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  if (elements.easySayAddDigit) {
    elements.easySayAddDigit.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  // Passphrase controls
  if (elements.passphraseWordCount) {
    elements.passphraseWordCount.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  if (elements.passphraseSeparator) {
    elements.passphraseSeparator.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
    });
  }

  if (elements.passphraseCapitalize) {
    elements.passphraseCapitalize.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  if (elements.passphraseAddDigits) {
    elements.passphraseAddDigits.addEventListener("change", () => {
      savePasswordSettings(getPasswordSettings(elements));
      updateCrackTimeFromSettings(elements);
    });
  }

  // Crack hardware selection
  if (elements.crackHardwareSelect) {
    elements.crackHardwareSelect.addEventListener("change", () => {
      saveCrackHardware(elements.crackHardwareSelect.value);
      updateCrackTimeFromSettings(elements);
    });
  }

  // User ID handlers
  const uidGenerateBtn = document.getElementById("uidGenerateBtn");
  if (uidGenerateBtn) {
    uidGenerateBtn.addEventListener("click", () => {
      handleGenerateUserIds(elements);
      saveUserIdSettings(getUserIdSettings(elements));
    });
  }

  const uidShareBtn = document.getElementById("uidShare");
  if (uidShareBtn) {
    uidShareBtn.addEventListener("click", () => {
      handleShareUserId(elements);
    });
  }

  if (elements.uidMode) {
    elements.uidMode.addEventListener("change", () => {
      updateUserIdModeUI(elements);
      saveUserIdSettings(getUserIdSettings(elements));
    });
  }

  // User ID controls
  [elements.uidSyllables, elements.uidAddDigits, elements.uidDigitsCount, 
   elements.uidAddSuffix, elements.uidSuffix, elements.uidMaxLength,
   elements.uidWordsCount, elements.uidWordsSeparator, elements.uidWordsAddDigits,
   elements.uidWordsDigitsCount, elements.uidWordsMaxLength, elements.uidCount].forEach((el) => {
    if (el) {
      el.addEventListener("change", () => {
        saveUserIdSettings(getUserIdSettings(elements));
      });
    }
  });

  // Reset user ID settings
  const resetBtn = document.getElementById("resetUserIdSettings");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("userIdSettings");
      elements.uidMode.value = "cvc";
      elements.uidSyllables.value = "2";
      elements.uidAddDigits.checked = true;
      elements.uidDigitsCount.value = "2";
      elements.uidAddSuffix.checked = true;
      elements.uidSuffix.value = "dev";
      elements.uidMaxLength.value = "15";
      elements.uidWordsCount.value = "2";
      elements.uidWordsSeparator.value = "_";
      elements.uidWordsAddDigits.checked = false;
      elements.uidWordsDigitsCount.value = "2";
      elements.uidWordsMaxLength.value = "20";
      elements.uidCount.value = "10";
      updateUserIdModeUI(elements);
    });
  }
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init().catch(err => {
      console.error("Failed to initialize:", err);
    });
  });
} else {
  init().catch(err => {
    console.error("Failed to initialize:", err);
  });
}
